import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { requireRole } from "../../middlewares/role.middleware.js";

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
  searchTutorials
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


//
// MUST BE LAST — PUBLIC FULL VIEW
//

tutorialRouter.get("/:tutorialId", getTutorial);

export default tutorialRouter;
