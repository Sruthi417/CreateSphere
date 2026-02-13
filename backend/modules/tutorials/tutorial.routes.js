import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { requireRole } from "../../middlewares/role.middleware.js";
import { uploadMiddleware } from "../../middlewares/upload.middleware.js";

import {
  createTutorial,
  getTutorial,
  listAllTutorials,
  listTutorialsByCategory,
  listCreatorTutorials,
  listMyTutorials,
  updateTutorial,
  removeTutorial,
  restoreTutorial,
  searchTutorials,
  enrollTutorial
} from "./tutorial.controller.js";

const tutorialRouter = Router();


//
// PUBLIC ROUTES
//

tutorialRouter.get("/", listAllTutorials);

tutorialRouter.get("/search", searchTutorials);

tutorialRouter.get("/category/:categoryId", listTutorialsByCategory);

tutorialRouter.get("/creator/:creatorId", listCreatorTutorials);


//
// CREATOR DASHBOARD
//

tutorialRouter.get(
  "/me/list",
  authMiddleware,
  requireRole("creator"),
  listMyTutorials
);


//
// CREATOR ACTIONS
//

tutorialRouter.post(
  "/",
  authMiddleware,
  requireRole("creator"),
  createTutorial
);

tutorialRouter.put(
  "/:tutorialId",
  authMiddleware,
  requireRole("creator"),
  updateTutorial
);

tutorialRouter.delete(
  "/:tutorialId",
  authMiddleware,
  requireRole("creator"),
  removeTutorial
);

tutorialRouter.post(
  "/:tutorialId/restore",
  authMiddleware,
  requireRole("creator"),
  restoreTutorial
);

// Upload tutorial thumbnail
tutorialRouter.post(
  "/thumbnail/upload",
  authMiddleware,
  requireRole("creator"),
  uploadMiddleware.single("image"),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No image uploaded" });
    }

    const imageUrl = `/uploads/${req.file.filename}`;

    return res.status(200).json({
      success: true,
      url: imageUrl
    });
  }
);


//
// MUST BE LAST — PUBLIC FULL VIEW
//

tutorialRouter.get("/:tutorialId", getTutorial);

// Enroll in tutorial
tutorialRouter.post("/:tutorialId/enroll", authMiddleware, enrollTutorial);

export default tutorialRouter;
