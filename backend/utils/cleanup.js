import ChatbotSession from "../modules/chatbot/chatbot.model.js";
import { deleteSessionImages } from "./chatbot.imageStorage.js";

/**
 * Runs every 60 sec
 * - checks expired sessions
 * - deletes session images folder
 * - marks session as expired
 */
export const startChatbotCleanupWorker = () => {
  setInterval(async () => {
    try {
      const now = new Date();

      const expiredSessions = await ChatbotSession.find({
        status: "active",
        expiresAt: { $lte: now }
      }).select("sessionId");

      for (const s of expiredSessions) {
        // ✅ delete file folder
        deleteSessionImages(s.sessionId);

        // ✅ mark expired
        await ChatbotSession.updateOne(
          { sessionId: s.sessionId },
          { $set: { status: "expired", endedAt: new Date() } }
        );

        console.log("✅ Cleaned expired session:", s.sessionId);
      }
    } catch (err) {
      console.error("❌ Cleanup worker error:", err.message);
    }
  }, 60 * 1000); // every 60 seconds
};
