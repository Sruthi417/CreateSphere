import jwt from "jsonwebtoken";
import User from "../modules/users/user.model.js";
import { JWT_SECRET } from "../config/env.js";

/**
 * Required authentication middleware
 * Blocks request if no valid token exists
 * Used for protected routes that require authentication
 */
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

/**
 * Optional authentication middleware
 * Sets req.user if valid token exists, but doesn't block if no token
 * Used for public routes that need to show personalized data for logged-in users
 * (e.g., showing "Following" button state on creator profiles)
 */
export const optionalAuthMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // If no auth header, continue without setting req.user
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next();
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findById(decoded.id).select("role onboardingStatus isBlocked emailVerified");

    // If user not found or blocked, continue without setting req.user
    if (!user || user.isBlocked || !user.emailVerified) {
      return next();
    }

    // Set user info for authenticated requests
    req.user = {
      id: user._id,
      role: user.role,
      onboardingStatus: user.onboardingStatus,
      emailVerified: user.emailVerified,
    };

    next();
  } catch {
    // If token is invalid, continue without setting req.user
    next();
  }
};
