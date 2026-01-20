import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import {
  createReview,
  updateReview,
  deleteReview,
  getReviews
} from "./review.controller.js";

const reviewRouter = Router();

reviewRouter.get("/:targetType/:targetId", getReviews);

reviewRouter.post("/", authMiddleware, createReview);

reviewRouter.put("/:reviewId", authMiddleware, updateReview);

reviewRouter.delete("/:reviewId", authMiddleware, deleteReview);

export default reviewRouter;
