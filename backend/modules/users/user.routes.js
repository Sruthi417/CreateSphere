import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";

import {
  getMyProfile,
  updateMyProfile,

  followCreator,
  unfollowCreator,
  getMyFollowing,

  addFavoriteProduct,
  removeFavoriteProduct,
  getMyFavorites

} from "./user.controller.js";

const userRoutes = Router();


// ---------- AUTH REQUIRED ----------
userRoutes.get("/me/profile", authMiddleware, getMyProfile);
userRoutes.put("/me/profile", authMiddleware, updateMyProfile);


// ---------- FOLLOW SYSTEM ----------
userRoutes.post("/follow/:creatorId", authMiddleware, followCreator);
userRoutes.post("/unfollow/:creatorId", authMiddleware, unfollowCreator);
userRoutes.get("/me/following", authMiddleware, getMyFollowing);


// ---------- FAVORITES ----------
userRoutes.post("/favorites/:productId", authMiddleware, addFavoriteProduct);
userRoutes.delete("/favorites/:productId", authMiddleware, removeFavoriteProduct);
userRoutes.get("/me/favorites", authMiddleware, getMyFavorites);


export default userRoutes;
