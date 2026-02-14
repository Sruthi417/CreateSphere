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

  const cleanPrompt = prompt.trim().slice(0, 400); // slightly shorter for stability
  const seed = Math.floor(Math.random() * 1000000);

  // Using a more direct URL format that often bypasses some Cloudflare 530 issues
  const url = `https://pollinations.ai/p/${encodeURIComponent(cleanPrompt)}?width=768&height=768&seed=${seed}&model=flux`;

  try {
    const response = await axios.get(url, {
      responseType: "arraybuffer",
      timeout: 30000, // 30s is usually enough
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
        "Accept": "image/*"
      }
    });

    return Buffer.from(response.data).toString("base64");
  } catch (err) {
    console.error("❌ Pollinations Request Error:", err.message);
    const status = err?.response?.status;

    if (status === 429) {
      throw new Error("Pollinations rate limit reached. Try again in 1 minute.");
    }

    if (status === 500 || status === 503 || status === 530) {
      throw new Error("Pollinations server is currently overloaded or undergoing maintenance. Please try again in a few minutes.");
    }

    throw new Error(`Failed to generate image from Pollinations: ${err.message}`);
  }
};
