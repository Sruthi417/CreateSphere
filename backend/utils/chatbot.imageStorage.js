import fs from "fs";
import path from "path";
import crypto from "crypto";

/**
 * Saves base64 image into /uploads/chatbot/<sessionId>/<filename>.png
 * Returns public URL: /uploads/chatbot/<sessionId>/<filename>.png
 */
export const saveBase64ToPngUrl = (base64, sessionId) => {
  if (!base64) throw new Error("base64 image required");

  const cleanBase64 = base64.includes("base64,")
    ? base64.split("base64,")[1]
    : base64;

  const buffer = Buffer.from(cleanBase64, "base64");

  const folder = path.join(process.cwd(), "uploads", "chatbot", sessionId);
  if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });

  const filename = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}.png`;
  const filepath = path.join(folder, filename);

  fs.writeFileSync(filepath, buffer);

  return `/uploads/chatbot/${sessionId}/${filename}`;
};

/**
 * Delete all images stored in /uploads/chatbot/<sessionId>
 */
export const deleteSessionImages = (sessionId) => {
  const folder = path.join(process.cwd(), "uploads", "chatbot", sessionId);
  if (fs.existsSync(folder)) {
    fs.rmSync(folder, { recursive: true, force: true });
  }
};
