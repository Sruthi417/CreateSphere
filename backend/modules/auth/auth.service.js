import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

import User from "../users/user.model.js";
import { sendMail } from "../../utils/mailer.js";

import {
  JWT_SECRET,
  JWT_EXPIRY,
  CLIENT_URL,
  EMAIL_VERIFY_EXPIRY_MIN,
  RESET_PASS_EXPIRY_MIN
} from "../../config/env.js";


/* -------------------------
   Generate JWT
-------------------------- */
export const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRY || "7d" }
  );
};


/* -------------------------
   Create hashed token for DB storage
-------------------------- */
const createHashedToken = () => {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const hashed = crypto.createHash("sha256").update(rawToken).digest("hex");
  return { rawToken, hashed };
};


/* =========================================================
   REGISTER USER (and send verification email)
========================================================= */
export const registerUser = async (data) => {
  let { name, email, password, signupType = "user" } = data;

  const normalizedEmail = email.trim().toLowerCase();

  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) throw new Error("An account already exists with this email");

  const hashedPassword = await bcrypt.hash(password, 10);

  const { rawToken, hashed } = createHashedToken();
  const verifyExpiryMinutes = parseInt(EMAIL_VERIFY_EXPIRY_MIN || "30");

  const user = await User.create({
    name,
    email: normalizedEmail,
    password: hashedPassword,

    role: "user",
    onboardingStatus: signupType === "creator" ? "creator_pending" : "none",

    emailVerified: false,
    emailVerificationToken: hashed,
    emailVerificationExpires: new Date(Date.now() + verifyExpiryMinutes * 60 * 1000),
  });

  // ✅ Send email verification link
  const verifyLink = `${CLIENT_URL}/verify-email?token=${rawToken}`;

  await sendMail({
    to: user.email,
    subject: "Verify your CreateSphere account",
    html: `
      <h2>Welcome to CreateSphere 🎨</h2>
      <p>Please verify your email to activate your account.</p>
      <a href="${verifyLink}" target="_blank">✅ Verify Email</a>
      <p>This link expires in ${verifyExpiryMinutes} minutes.</p>
    `,
  });

  // ✅ Don’t give JWT before verification (recommended)
  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      onboardingStatus: user.onboardingStatus,
      emailVerified: user.emailVerified,
    },
  };
};


/* =========================================================
   VERIFY EMAIL
========================================================= */
export const verifyEmail = async (token) => {
  if (!token) throw new Error("Verification token required");

  const hashed = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    emailVerificationToken: hashed,
    emailVerificationExpires: { $gt: new Date() },
  }).select("+emailVerificationToken +emailVerificationExpires");

  // 🔥 CASE 1: Token matches active verification
  if (user) {
    if (user.emailVerified) {
      return { alreadyVerified: true };
    }

    user.emailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;

    await user.save();

    return { verified: true };
  }

  // 🔥 CASE 2: Maybe already verified earlier (token used before)
  const alreadyVerifiedUser = await User.findOne({
    emailVerificationToken: null,
    emailVerified: true,
  });

  if (alreadyVerifiedUser) {
    return { alreadyVerified: true };
  }

  // 🔥 CASE 3: Truly invalid or expired
  throw new Error("Invalid or expired verification token");
};



/* =========================================================
   RESEND EMAIL VERIFICATION
========================================================= */
export const resendVerificationEmail = async (email) => {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await User.findOne({ email: normalizedEmail }).select(
    "+emailVerificationToken +emailVerificationExpires"
  );

  if (!user) throw new Error("Account not found");
  if (user.emailVerified) throw new Error("Email already verified");

  const { rawToken, hashed } = createHashedToken();
  const verifyExpiryMinutes = parseInt(EMAIL_VERIFY_EXPIRY_MIN || "30");

  user.emailVerificationToken = hashed;
  user.emailVerificationExpires = new Date(Date.now() + verifyExpiryMinutes * 60 * 1000);
  await user.save();

  const verifyLink = `${CLIENT_URL}/verify-email?token=${rawToken}`;


  await sendMail({
    to: user.email,
    subject: "Verify your CreateSphere account (Resend)",
    html: `
      <h3>Email Verification</h3>
      <p>Click below to verify your email:</p>
      <a href="${verifyLink}" target="_blank">✅ Verify Email</a>
      <p>This link expires in ${verifyExpiryMinutes} minutes.</p>
    `,
  });

  return true;
};


/* =========================================================
   LOGIN (blocked until verified)
========================================================= */
export const loginUser = async (email, password) => {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await User.findOne({ email: normalizedEmail }).select("+password");

  if (!user) throw new Error("Invalid email or password");
  if (user.isBlocked) throw new Error("This account has been blocked by admin");

  // ✅ must be verified
  if (!user.emailVerified) {
    throw new Error("Please verify your email before logging in");
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new Error("Invalid email or password");

  const token = generateToken(user);

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      onboardingStatus: user.onboardingStatus,
      emailVerified: user.emailVerified,
    },
    token,
  };
};


/* =========================================================
   FORGOT PASSWORD
========================================================= */
export const forgotPassword = async (email) => {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await User.findOne({ email: normalizedEmail }).select(
    "+passwordResetToken +passwordResetExpires"
  );

  if (!user) throw new Error("Account not found");

  // optional: allow reset only if verified
  if (!user.emailVerified) throw new Error("Verify email before resetting password");

  const { rawToken, hashed } = createHashedToken();
  const resetExpiryMinutes = parseInt(RESET_PASS_EXPIRY_MIN || "15");

  user.passwordResetToken = hashed;
  user.passwordResetExpires = new Date(Date.now() + resetExpiryMinutes * 60 * 1000);

  await user.save();

  const resetLink = `${CLIENT_URL}/reset-password?token=${rawToken}`;

  await sendMail({
    to: user.email,
    subject: "Reset your CreateSphere password",
    html: `
      <h3>Password Reset Request</h3>
      <p>Click below to reset your password:</p>
      <a href="${resetLink}" target="_blank">🔑 Reset Password</a>
      <p>This link expires in ${resetExpiryMinutes} minutes.</p>
    `,
  });

  return true;
};


/* =========================================================
   RESET PASSWORD
========================================================= */
export const resetPassword = async (token, newPassword) => {
  if (!token) throw new Error("Reset token required");
  if (!newPassword || newPassword.length < 6) throw new Error("Password must be at least 6 characters");

  const hashed = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashed,
    passwordResetExpires: { $gt: new Date() },
  }).select("+passwordResetToken +passwordResetExpires");

  if (!user) throw new Error("Invalid or expired reset token");

  user.password = await bcrypt.hash(newPassword, 10);
  user.passwordResetToken = null;
  user.passwordResetExpires = null;

  await user.save();

  return true;
};


/* -------------------------
   LOGOUT (stateless)
-------------------------- */
export const logoutUser = async () => true;
