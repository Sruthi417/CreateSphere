import { Router } from "express";
import {
  register,
  login,
  logout,
  verifyEmailController,
  resendVerifyEmailController,
  forgotPasswordController,
  resetPasswordController
} from "./auth.controller.js";

const authRoutes = Router();

authRoutes.post("/register", register);
authRoutes.get("/verify-email", verifyEmailController);
authRoutes.post("/resend-verification", resendVerifyEmailController);

authRoutes.post("/login", login);
authRoutes.post("/logout", logout);

authRoutes.post("/forgot-password", forgotPasswordController);
authRoutes.post("/reset-password", resetPasswordController);

export default authRoutes;
