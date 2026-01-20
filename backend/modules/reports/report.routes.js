import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import {
  submitReport,
  getReportsForTarget
} from "./report.controller.js";

const reportRouter = Router();

// Submit a report
reportRouter.post("/", authMiddleware, submitReport);

// View reports for a specific item
reportRouter.get("/:targetType/:targetId", authMiddleware, getReportsForTarget);

export default reportRouter;
