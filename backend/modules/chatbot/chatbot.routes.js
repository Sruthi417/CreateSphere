import { Router } from "express";
import multer from "multer";
import {
  analyzeChat,
  generateImage,
  getSession,
  endSession,
  adminListSessions
} from "./chatbot.controller.js";

const chatbotRouter = Router();
const upload = multer({ dest: "uploads/" });

chatbotRouter.post("/analyze", upload.single("image"), analyzeChat);
chatbotRouter.post("/generate-image", generateImage);

// restore
chatbotRouter.get("/session/:sessionId", getSession);

// end
chatbotRouter.delete("/session/:sessionId", endSession);

// admin list (summary)
chatbotRouter.get("/admin/sessions", adminListSessions);

export default chatbotRouter;
