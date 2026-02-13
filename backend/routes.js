import { Router } from "express";

import authRoutes from "./modules/auth/auth.routes.js";
import creatorRoutes from "./modules/creators/creator.routes.js";
import userRoutes from "./modules/users/user.routes.js";
import productRouter from "./modules/products/product.routes.js";
import categoryRoutes from "./modules/categories/category.routes.js";
import tutorialRouter from "./modules/tutorials/tutorial.routes.js";
import reviewRouter from "./modules/reviews/review.routes.js";
import reportRouter from "./modules/reports/report.routes.js";
import adminRouter from "./modules/admin/admin.routes.js";
import chatbotRouter from "./modules/chatbot/chatbot.routes.js";
import chatRouter from "./modules/chat/chat.routes.js";

const router = Router();

// Base module routes
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/creators", creatorRoutes);
router.use("/products", productRouter);
router.use("/categories", categoryRoutes);
router.use("/tutorials", tutorialRouter);
router.use("/reviews", reviewRouter);
router.use("/reports", reportRouter);
router.use("/admin", adminRouter);
router.use("/chatbot", chatbotRouter);
router.use("/chat", chatRouter);

export default router;
