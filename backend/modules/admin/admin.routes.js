import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { requireRole } from "../../middlewares/role.middleware.js";

import {
  adminLogin,
  listCreatorsPendingVerification,
  approveCreatorVerification,
  rejectCreatorVerification,
  revokeCreatorVerification,
  listPriorityReports,
  adminModerateAccount
} from "./admin.controller.js";

import {
  adminHideContent,
  adminRestoreContent,
  adminRemoveContent
} from "./contentModeration.controller.js";

import {
  adminResolveUserReport
} from "./reportModeration.controller.js";

const adminRouter = Router();

adminRouter.post("/login", adminLogin);

adminRouter.use(authMiddleware, requireRole("admin"));

/* Creator verification */
adminRouter.get("/creators/verification/pending", listCreatorsPendingVerification);
adminRouter.post("/creators/:creatorId/verify", approveCreatorVerification);
adminRouter.post("/creators/:creatorId/reject", rejectCreatorVerification);
adminRouter.post("/creators/:creatorId/revoke", revokeCreatorVerification);

/* Priority report queue */
adminRouter.get("/reports/priority", listPriorityReports);

/* User / Creator moderation */
adminRouter.post("/moderate/:targetId", adminModerateAccount);

/* Resolve reports */
adminRouter.post("/reports/:reportId/resolve", adminResolveUserReport);

/* Content moderation */
adminRouter.post("/content/:targetType/:targetId/hide", adminHideContent);
adminRouter.post("/content/:targetType/:targetId/restore", adminRestoreContent);
adminRouter.post("/content/:targetType/:targetId/remove", adminRemoveContent);

export default adminRouter;
