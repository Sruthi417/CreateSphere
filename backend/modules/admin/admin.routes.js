import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { requireRole } from "../../middlewares/role.middleware.js";

import {
  adminLogin,
  listCreatorsPendingVerification,
  approveCreatorVerification,
  rejectCreatorVerification,
  revokeCreatorVerification,
  listVerifiedCreators,
  listPriorityReports,
  listReportedCreators,
  getReportDetails,
  dismissReports,
  listAdmins,
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
adminRouter.get("/creators/verified", listVerifiedCreators);
adminRouter.post("/creators/:creatorId/verify", approveCreatorVerification);
adminRouter.post("/creators/:creatorId/reject", rejectCreatorVerification);
adminRouter.post("/creators/:creatorId/revoke", revokeCreatorVerification);

/* Priority report queue */
adminRouter.get("/reports/priority", listPriorityReports);
adminRouter.get("/reports/creators", listReportedCreators);
adminRouter.get("/reports/details/:targetId", getReportDetails);
adminRouter.delete("/reports/dismiss/:targetId", dismissReports);

/* User / Creator / Admin moderation */
adminRouter.get("/admins/list", listAdmins);
adminRouter.post("/moderate/:targetId", adminModerateAccount);

/* Resolve reports */
adminRouter.post("/reports/:reportId/resolve", adminResolveUserReport);

/* Content moderation */
adminRouter.post("/content/:targetType/:targetId/hide", adminHideContent);
adminRouter.post("/content/:targetType/:targetId/restore", adminRestoreContent);
adminRouter.post("/content/:targetType/:targetId/remove", adminRemoveContent);

export default adminRouter;
