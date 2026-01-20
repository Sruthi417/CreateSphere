import jwt from "jsonwebtoken";
import User from "../modules/users/user.model.js";
import { JWT_SECRET } from "../config/env.js";

export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findById(decoded.id).select("role onboardingStatus isBlocked emailVerified");

    if (!user) {
      return res.status(401).json({ success: false, message: "Account not found" });
    }

    if (user.isBlocked) {
      return res.status(403).json({ success: false, message: "Your account has been blocked by admin" });
    }

    // ✅ protect api from unverified users
    if (!user.emailVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email before accessing this resource",
      });
    }

    req.user = {
      id: user._id,
      role: user.role,
      onboardingStatus: user.onboardingStatus,
      emailVerified: user.emailVerified,
    };

    next();
  } catch {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};
