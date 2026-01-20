import axios from "axios";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GEMINI_API_KEY } from "../../config/env.js";

if (!GEMINI_API_KEY) throw new Error("❌ GEMINI_API_KEY missing in env");

// ✅ Gemini setup
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export const craftModel = genAI.getGenerativeModel({
  model: "gemini-2.5-flash"
});

/**
 * ✅ Pollinations image generation
 * Returns BASE64 PNG/JPG bytes (as base64 string)
 */
export const generateImagePollinations = async (prompt) => {
  if (!prompt || typeof prompt !== "string") {
    throw new Error("Prompt is required for image generation");
  }

  const cleanPrompt = prompt.trim().slice(0, 500); // prevent huge prompt abuse
  const seed = Date.now();

  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(
    cleanPrompt
  )}?width=768&height=768&nologo=true&seed=${seed}`;

  try {
    const response = await axios.get(url, {
      responseType: "arraybuffer",
      timeout: 60000 // ✅ 60 seconds timeout
    });

    return Buffer.from(response.data).toString("base64");
  } catch (err) {
    const status = err?.response?.status;

    if (status === 429) {
      throw new Error("Pollinations rate limit reached. Try again in 1 minute.");
    }

    if (status === 500 || status === 503) {
      throw new Error("Pollinations server is busy. Try again in a few seconds.");
    }

    throw new Error("Failed to generate image from Pollinations.");
  }
};
