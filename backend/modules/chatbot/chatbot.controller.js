import fs from "fs";
import crypto from "crypto";
import ChatbotSession from "./chatbot.model.js";
import { craftModel, generateImagePollinations } from "./chatbot.service.js";
import { buildYoutubeLinks } from "../../utils/youtube.utils.js";
import { parseAIJSON } from "../../utils/json.utils.js";
import { saveBase64ToPngUrl } from "../../utils/chatbot.imageStorage.js";

const createSessionId = () => `sess_${crypto.randomUUID()}`;
const buildExpiry = () => new Date(Date.now() + 60 * 60 * 1000); // 1 hour idle

// ✅ clean markdown junk
const cleanText = (txt = "") =>
  String(txt)
    .replace(/\*\*/g, "")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`/g, "")
    .replace(/\r/g, "")
    .replace(/\\n/g, "\n")
    .trim();

// ✅ quick chat title for admin view
const buildTitleFromMaterials = (materials = []) => {
  if (!materials.length) return "Craft Chat Session";
  return `Craft ideas using ${materials.slice(0, 3).join(", ")}`;
};

// ✅ mark expired
const markExpiredIfNeeded = async (session) => {
  if (!session) return null;

  if (session.status === "active" && new Date() > new Date(session.expiresAt)) {
    session.status = "expired";
    session.endedAt = new Date();
    await session.save();
  }
  return session;
};

// ✅ session history
const buildGeminiHistory = (messages, limit = 10) => {
  const recent = messages.slice(-limit);
  return recent
    .map((m) => {
      if (m.sender === "user")
        return `USER: ${m.input?.text || "[non-text input]"}`;
      if (m.sender === "ai") return `AI: ${m.output?.narration || ""}`;
      return "";
    })
    .filter(Boolean)
    .join("\n");
};

/** ✅ classify craft-only */
const isCraftRelevant = async (inputText) => {
  const classify = await craftModel.generateContent(`
Return ONLY JSON.
Decide if this user message is related to recycling, waste reuse, DIY crafts, upcycling.

Format:
{ "craftRelated": true|false }

Message:
${inputText}
  `);

  const parsed = parseAIJSON(classify.response.text());
  return Boolean(parsed?.craftRelated);
};

/* =======================================================
   POST /api/chatbot/analyze
======================================================= */
export const analyzeChat = async (req, res) => {
  try {
    const image = req.file;
    const { text, speechText, sessionId: bodySessionId } = req.body;

    const inputText = (text || speechText || "").trim();
    const lower = inputText.toLowerCase();

    const sessionId =
      req.headers["x-session-id"] ||
      req.headers["sessionid"] ||
      req.headers["sessionId"] ||
      bodySessionId ||
      createSessionId();

    // ✅ load / create session
    let session = await ChatbotSession.findOne({ sessionId });

    if (!session) {
      session = await ChatbotSession.create({
        sessionId,
        userId: req.user?.id || null,
        materials: [],
        lastIdeas: [],
        title: "",
        messages: [],
        expiresAt: buildExpiry(),
        lastActivityAt: new Date(),
        status: "active",
      });
    }

    session = await markExpiredIfNeeded(session);

    if (session.status !== "active") {
      return res.status(410).json({
        success: false,
        code: "SESSION_INACTIVE",
        message: `⚠ This session is ${session.status}. Please start a new chat.`,
        sessionStatus: session.status,
      });
    }

    // ✅ extend expiry each request
    session.expiresAt = buildExpiry();
    session.lastActivityAt = new Date();

    // ✅ save user message
    session.messages.push({
      sender: "user",
      input: {
        type: image ? "image" : speechText ? "audio" : "text",
        text: inputText || null,
        imageUrl: image?.path || null,
        audioUrl: null,
      },
    });

    await session.save();

    // ✅ detect "new ideas" or "quantity request"
    const numMatch = inputText.match(/(\d+|one|two|three|four|five|six|seven|eight|nine|ten)\s+(ideas|crafts|projects|items|things)/i);

    const userWantsNewIdeas =
      !!numMatch ||
      lower.includes("new ideas") ||
      lower.includes("more ideas") ||
      lower.includes("another") ||
      lower.includes("different ideas") ||
      lower.includes("generate again") ||
      lower.includes("give me") ||
      lower.includes("show me");

    const hasContext =
      (session.materials?.length || 0) > 0 ||
      (session.lastIdeas?.length || 0) > 0;

    const shouldExtractMaterials = !!image || userWantsNewIdeas || !hasContext;

    let extractedMaterials = [];

    /* ======================================================
       Extract materials
    ======================================================= */
    if (shouldExtractMaterials) {
      if (image) {
        const buffer = fs.readFileSync(image.path);

        try {
          fs.unlinkSync(image.path); // delete upload file
        } catch { }

        const visionResult = await craftModel.generateContent([
          {
            inlineData: {
              data: buffer.toString("base64"),
              mimeType: image.mimetype,
            },
          },
          `
Return ONLY JSON.
Extract reusable waste/craft materials visible in image.

Format:
{ "materials": ["item1","item2"] }

User note: ${inputText}
          `,
        ]);

        const parsed = parseAIJSON(visionResult.response.text());
        extractedMaterials = parsed?.materials || [];
      } else {
        const materialResult = await craftModel.generateContent(`
Return ONLY JSON.
Extract reusable/waste/craft materials from this text.

Format:
{ "materials": ["item1","item2"] }

Text:
${inputText}
        `);

        const parsed = parseAIJSON(materialResult.response.text());
        extractedMaterials = parsed?.materials || [];
      }
    }

    // ✅ store materials
    let materials = session.materials || [];

    if (extractedMaterials.length) {
      materials = extractedMaterials;
      session.materials = extractedMaterials;
      session.title = buildTitleFromMaterials(extractedMaterials);
      await session.save();
    }

    /* ======================================================
       craft-only restriction
    ======================================================= */
    const craftOk = materials.length > 0 || (await isCraftRelevant(inputText));

    if (!craftOk) {
      const narration =
        "Hey there! 👋\n\n" +
        "I'm CreateSphere's Craft Assistant, and I specialize in helping you create amazing things from recycled materials and waste items!\n\n" +
        "I can help you with:\n" +
        "• DIY craft projects using recyclable materials\n" +
        "• Upcycling household items\n" +
        "• Creative reuse of waste materials\n" +
        "• School craft projects\n\n" +
        "Try telling me what materials you have! For example:\n" +
        "\"I have a glass bottle and some paint\"\n" +
        "\"What can I make with cardboard boxes?\"\n" +
        "\"I want to upcycle plastic bottles\"\n\n" +
        "I'm excited to help you create something wonderful! 🎨✨";

      session.messages.push({ sender: "ai", output: { narration } });
      await session.save();

      return res.status(200).json({
        success: true,
        sessionId,
        materials: session.materials || [],
        narration,
        ideas: [],
      });
    }

    const memory = buildGeminiHistory(session.messages, 10);

    /* ======================================================
       Follow-up mode
    ======================================================= */
    const followUpMode = hasContext && !userWantsNewIdeas && !image;

    if (followUpMode) {
      const followResult = await craftModel.generateContent(`
You are CreateSphere Craft Assistant - a friendly, helpful AI that guides users in creating crafts.

Conversation context:
${memory}

Stored materials:
${(materials || []).join(", ")}

Previous ideas (JSON):
${JSON.stringify(session.lastIdeas || [])}

User follow-up question:
${inputText}

Respond in a natural, conversational way like you're chatting with a friend. 
Use proper paragraphs and line breaks for readability.
Be warm, encouraging, and helpful.
Return plain text ONLY. No markdown, no JSON, no special formatting.
      `);

      const narration = cleanText(followResult.response.text());

      session.messages.push({ sender: "ai", output: { narration } });
      await session.save();

      return res.status(200).json({
        success: true,
        sessionId,
        materials,
        narration,
        ideas: [],
      });
    }

    /* ======================================================
       Generation mode: generate ideas
    ======================================================= */
    let requestedCount = 3;
    if (numMatch) {
      const numStr = numMatch[1].toLowerCase();
      const numMap = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10 };
      requestedCount = numMap[numStr] || parseInt(numStr) || 3;
    }
    // Compulsory at least 3
    if (requestedCount < 3) requestedCount = 3;

    const ideasResult = await craftModel.generateContent(`
You are CreateSphere Craft Assistant - a warm, friendly AI that helps people create amazing crafts from recycled materials.

Conversation context:
${memory}

Materials available:
${materials.join(", ")}

YOUR TASK:
Generate EXACTLY ${requestedCount} creative, useful craft project ideas using ONLY the materials listed above.
If the user didn't specify a number, generate at least 3.

NARRATION GUIDELINES:
- Write a warm, natural, and detailed introduction (3-5 sentences)
- Sound excited and encouraging, like you're chatting with a friend
- Mention what materials you're using
- Example: "I'm so excited to show you what we can create with your ${materials.slice(0, 2).join(' and ')}! I've designed ${requestedCount} unique projects that range from home decor to practical storage solutions. Each one is special and perfect for different purposes!"

IMPORTANT RULES:
1. Generate EXACTLY ${requestedCount} ideas.
2. Each idea MUST have all required fields.
3. Make each idea unique and creative.
4. Include detailed, step-by-step instructions.
5. Add safety notes where relevant.
6. Create vivid, detailed image prompts for the "Visualize" feature.
7. Ensure "narration" for each idea acts as a "Short Description" for the card.

Return ONLY valid JSON in this exact format:
{
  "narration": "Your warm, friendly introduction here",
  "ideas": [
    {
      "ideaId": "idea_1",
      "title": "Creative Project Title",
      "narration": "Detailed short description of what this project is (2-3 sentences)",
      "difficulty": "easy|medium|hard",
      "tools_required": ["tool1", "tool2"],
      "steps": ["Step 1", "Step 2", "Step 3"],
      "safety_notes": ["Tip 1", "Tip 2"],
      "imagePrompt": "A high-quality 3D render/photo prompt of the finished craft, realistic, clean background"
    }
  ]
}
    `);

    const parsedIdeas = parseAIJSON(ideasResult.response.text());

    if (!parsedIdeas?.ideas?.length) {
      return res.status(500).json({
        success: false,
        code: "AI_INVALID_JSON",
        message: "⚠ AI returned invalid format. Please try again.",
      });
    }

    const enrichedIdeas = parsedIdeas.ideas.map((idea, idx) => {
      const ideaId = idea.ideaId || `idea_${idx + 1}`;
      return {
        ...idea,
        ideaId,
        youtubeLinks: buildYoutubeLinks(idea.title, materials),
      };
    });

    const youtubeLinks = enrichedIdeas.flatMap((i) => i.youtubeLinks);

    session.lastIdeas = enrichedIdeas;

    session.messages.push({
      sender: "ai",
      output: {
        narration: cleanText(parsedIdeas.narration),
        ideas: enrichedIdeas,
        youtubeLinks,
      },
    });

    await session.save();

    // ✅ include youtubeLinks in API response as well
    return res.status(200).json({
      success: true,
      sessionId,
      materials,
      narration: cleanText(parsedIdeas.narration),
      ideas: enrichedIdeas,
      youtubeLinks,
    });
  } catch (err) {
    console.error("❌ analyzeChat error:", err);

    return res.status(500).json({
      success: false,
      code: "SERVER_ERROR",
      message: "Internal server error",
    });
  }
};

/* =======================================================
   POST /api/chatbot/generate-image
   ✅ base64 -> png url -> store url in mongodb
======================================================= */
export const generateImage = async (req, res) => {
  try {
    const { sessionId, ideaId, imagePrompt, text } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        code: "SESSION_REQUIRED",
        message: "sessionId is required.",
      });
    }

    let session = await ChatbotSession.findOne({ sessionId });
    session = await markExpiredIfNeeded(session);

    if (!session) {
      return res.status(404).json({
        success: false,
        code: "SESSION_NOT_FOUND",
        message: "Session not found.",
      });
    }

    if (session.status !== "active") {
      return res.status(410).json({
        success: false,
        code: "SESSION_INACTIVE",
        message: "Session expired or ended.",
      });
    }

    const ideas = session.lastIdeas || [];
    let chosenIdea = null;

    // ideaId match
    if (ideaId && ideas.length) {
      chosenIdea = ideas.find((i) => i.ideaId === ideaId);
    }

    // "first second third"
    if (!chosenIdea && text && ideas.length) {
      const lower = text.toLowerCase();
      if (lower.includes("second")) chosenIdea = ideas[1] || null;
      else if (lower.includes("third")) chosenIdea = ideas[2] || null;
      else if (lower.includes("first")) chosenIdea = ideas[0] || null;
    }

    // ✅ prompt selection
    let promptToUse = imagePrompt || chosenIdea?.imagePrompt;

    if (!promptToUse && text) {
      promptToUse =
        `DIY handmade craft project image. ${text}. ` +
        `Realistic school project model, clean background, high quality product photo style.`;
    }

    if (!promptToUse) {
      return res.status(400).json({
        success: false,
        code: "PROMPT_REQUIRED",
        message: "Please provide ideaId, imagePrompt, or craft description text.",
      });
    }

    // 1) pollinations -> base64
    const base64Image = await generateImagePollinations(promptToUse);

    // 2) base64 -> png -> url
    const imageUrl = saveBase64ToPngUrl(base64Image, sessionId);

    // 3) store ONLY url in db
    session.messages.push({
      sender: "ai",
      output: {
        ideaId: chosenIdea?.ideaId || ideaId || null,
        narration: chosenIdea
          ? `Here is the image for: ${chosenIdea.title}`
          : "Here is the generated craft image.",
        generatedImageUrl: imageUrl, // ✅ STORE URL ONLY
      },
    });

    session.lastActivityAt = new Date();
    session.expiresAt = buildExpiry();
    await session.save();

    return res.status(200).json({
      success: true,
      ideaId: chosenIdea?.ideaId || ideaId || null,
      title: chosenIdea?.title || null,
      promptUsed: promptToUse,
      imageUrl, // ✅ frontend uses this
    });
  } catch (err) {
    console.error("❌ generateImage error:", err);

    return res.status(500).json({
      success: false,
      code: "IMAGE_GEN_FAILED",
      message: "⚠ Image generation failed. Please try again.",
    });
  }
};

/* =======================================================
   GET /api/chatbot/session/:sessionId
======================================================= */
export const getSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    let session = await ChatbotSession.findOne({ sessionId }).lean();
    if (!session) return res.status(404).json({ success: false });

    // mark expired if needed
    if (session.status === "active" && new Date() > new Date(session.expiresAt)) {
      await ChatbotSession.updateOne(
        { sessionId },
        { $set: { status: "expired", endedAt: new Date() } }
      );
      session.status = "expired";
    }

    return res.status(200).json({ success: true, data: session });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/* =======================================================
   DELETE /api/chatbot/session/:sessionId
======================================================= */
export const endSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await ChatbotSession.findOne({ sessionId });
    if (!session) {
      return res
        .status(404)
        .json({ success: false, message: "Session not found" });
    }

    session.status = "ended";
    session.endedAt = new Date();
    await session.save();

    return res.status(200).json({ success: true, message: "Session ended" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/* =======================================================
   ADMIN: GET /api/chatbot/admin/sessions
======================================================= */
export const adminListSessions = async (req, res) => {
  try {
    const sessions = await ChatbotSession.find({})
      .select("sessionId title status createdAt lastActivityAt expiresAt endedAt")
      .sort({ createdAt: -1 })
      .lean();

    return res
      .status(200)
      .json({ success: true, count: sessions.length, data: sessions });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
