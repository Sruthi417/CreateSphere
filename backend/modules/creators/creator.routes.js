import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { requireRole } from "../../middlewares/role.middleware.js";

import {
  startOnboarding,
  completeCreatorSetup,
  getMyCreatorProfile,
  listCreators,
  getCreatorPublicProfile,
  updateCreatorProfile,
  deactivateCreatorProfile,
  reactivateCreatorProfile,
  listCreatorsByCategory,
  searchCreators
} from "./creator.controller.js";

const creatorRoutes = Router();

//
// =====================
//  PUBLIC CREATOR ROUTES
// =====================
//

// Home / Explore — creator cards (paginated)
creatorRoutes.get("/", listCreators);

// Search creators
creatorRoutes.get("/search", searchCreators);

// Creators filtered by category
creatorRoutes.get("/category/:categoryId", listCreatorsByCategory);

// Public creator profile (full page)
creatorRoutes.get("/:creatorId", getCreatorPublicProfile);


//
// =====================
//  AUTH / ONBOARDING
// =====================
//

// Start creator onboarding (user → creator_pending)
creatorRoutes.post("/start",authMiddleware,startOnboarding);

// Complete setup (become creator)
creatorRoutes.post("/complete",authMiddleware,completeCreatorSetup);


//
// =====================
//  CREATOR DASHBOARD
// =====================
//

// View my creator profile
creatorRoutes.get("/me/profile",authMiddleware,requireRole("creator"),getMyCreatorProfile);

// Update creator profile
creatorRoutes.put("/me/profile",authMiddleware,requireRole("creator"),updateCreatorProfile);

// Deactivate creator mode
creatorRoutes.post("/me/deactivate",authMiddleware,requireRole("creator"),deactivateCreatorProfile);

// Reactivate creator mode
creatorRoutes.post("/me/reactivate",authMiddleware,reactivateCreatorProfile);

export default creatorRoutes;
