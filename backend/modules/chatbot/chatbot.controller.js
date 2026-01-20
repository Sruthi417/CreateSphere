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

    // ✅ detect "new ideas"
    const userWantsNewIdeas =
      lower.includes("new ideas") ||
      lower.includes("more ideas") ||
      lower.includes("another") ||
      lower.includes("different ideas") ||
      lower.includes("generate again");

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
        } catch {}

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
        "🚫 CreateSphere bot supports ONLY waste / craft reuse.\n" +
        "Please ask something related to DIY, upcycling, recycling materials.\n" +
        "Example: “I have plastic bottle and cardboard. What can I make?”";

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
You are CreateSphere Craft Assistant.

Conversation context:
${memory}

Stored materials:
${(materials || []).join(", ")}

Previous ideas (JSON):
${JSON.stringify(session.lastIdeas || [])}

User follow-up:
${inputText}

Return plain text ONLY. No markdown.
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
       Generation mode: generate 3 ideas
    ======================================================= */
    const ideasResult = await craftModel.generateContent(`
You are CreateSphere Craft Assistant.

Conversation context:
${memory}

Return ONLY valid JSON.

Use ONLY these materials:
${materials.join(", ")}

Generate 3 creative useful products.

JSON:
{
  "narration": "short intro narration",
  "ideas": [
    {
      "ideaId": "idea_1",
      "title": "string",
      "narration": "string",
      "difficulty": "easy|medium|hard",
      "tools_required": ["tool1"],
      "steps": ["step1","step2"],
      "safety_notes": ["note1"],
      "imagePrompt": "a clear image prompt"
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

    return res.status(200).json({
      success: true,
      sessionId,
      materials,
      narration: cleanText(parsedIdeas.narration),
      ideas: enrichedIdeas,
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
