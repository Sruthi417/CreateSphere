import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";

import {
  openConversation,
  sendMessage,
  getMessages,
  listMyConversations
} from "./chat.controller.js";

const chatRouter = Router();

// inbox list
chatRouter.get("/conversations", authMiddleware, listMyConversations);

// open / create chat
chatRouter.post("/open/:userId", authMiddleware, openConversation);

// messages
chatRouter.get("/:conversationId", authMiddleware, getMessages);

// send message
chatRouter.post("/:conversationId", authMiddleware, sendMessage);

export default chatRouter;
