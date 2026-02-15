import axios from "axios";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GEMINI_API_KEY, HF_API_KEY } from "../../config/env.js";

if (!GEMINI_API_KEY) throw new Error("❌ GEMINI_API_KEY missing in env");
if (!HF_API_KEY) throw new Error("❌ HF_API_KEY missing in env");

// ✅ Gemini setup
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export const craftModel = genAI.getGenerativeModel({
  model: "gemini-2.5-flash"
});

/**
 * ✅ Image generation using Hugging Face (Reliable fallback for Pollinations)
 * Returns BASE64 PNG bytes
 */
export const generateImagePollinations = async (prompt) => {
  if (!prompt || typeof prompt !== "string") {
    throw new Error("Prompt is required for image generation");
  }

  const cleanPrompt = prompt.trim().slice(0, 500);

  // We use Hugging Face because Pollinations is currently unstable/requires key
  const hfToken = HF_API_KEY;
  const model = "black-forest-labs/FLUX.1-schnell"; // High quality, fast model
  const url = `https://router.huggingface.co/hf-inference/models/${model}`;

  try {
    const response = await axios({
      url,
      method: "POST",
      headers: {
        Authorization: `Bearer ${hfToken}`,
        "Content-Type": "application/json",
        "Accept": "image/png"
      },
      data: JSON.stringify({
        inputs: cleanPrompt,
        parameters: {
          width: 768,
          height: 768
        }
      }),
      responseType: "arraybuffer",
      timeout: 60000, // HF can take some time
    });

    // Check if we actually got an image
    const contentType = response.headers["content-type"];
    if (contentType && !contentType.includes("image")) {
      const errorData = Buffer.from(response.data).toString();
      throw new Error(`HF returned non-image response: ${errorData.slice(0, 100)}`);
    }

    return Buffer.from(response.data).toString("base64");
  } catch (err) {
    console.error("❌ Image Generation Error:", err.message);

    // Detailed error logging
    if (err.response?.data instanceof Buffer) {
      console.error("Error Detail:", Buffer.from(err.response.data).toString());
    }

    const status = err?.response?.status;
    if (status === 429) {
      throw new Error("Image generation rate limit reached. Please try again in a minute.");
    }
    if (status === 503 || status === 504) {
      throw new Error("Image generation server is busy. Retrying in a few seconds might help.");
    }

    throw new Error(`Failed to generate image: ${err.message}`);
  }
};
