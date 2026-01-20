import { Router } from "express";

import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { requireRole } from "../../middlewares/role.middleware.js";

import {
  createCategory,
  getActiveCategories,
  getCategoryBySlug,
  updateCategory,
  deactivateCategory,
  reactivateCategory
} from "./category.controller.js";

const categoryRoutes = Router();


// ---------- PUBLIC ----------
categoryRoutes.get("/", getActiveCategories);
categoryRoutes.get("/:slug", getCategoryBySlug);


// ---------- ADMIN ----------
categoryRoutes.post(
  "/",
  authMiddleware,
  requireRole("admin"),
  createCategory
);

categoryRoutes.put(
  "/:id",
  authMiddleware,
  requireRole("admin"),
  updateCategory
);

categoryRoutes.post(
  "/:id/deactivate",
  authMiddleware,
  requireRole("admin"),
  deactivateCategory
);

categoryRoutes.post(
  "/:id/reactivate",
  authMiddleware,
  requireRole("admin"),
  reactivateCategory
);


export default categoryRoutes;
