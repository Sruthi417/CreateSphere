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
  if (existing) {
    if (existing.emailVerified) {
      throw new Error("An account already exists with this email");
    } else {
      // User exists but not verified - potentially from a previous failed/timeout attempt
      // Resend verification automatically to help the user get unstuck
      const { rawToken, hashed } = createHashedToken();
      const verifyExpiryMinutes = parseInt(EMAIL_VERIFY_EXPIRY_MIN || "30");
      
      existing.emailVerificationToken = hashed;
      existing.emailVerificationExpires = new Date(Date.now() + verifyExpiryMinutes * 60 * 1000);
      await existing.save();

      const verifyLink = `${CLIENT_URL}/verify-email?token=${rawToken}&email=${encodeURIComponent(existing.email)}`;

      sendMail({
        to: existing.email,
        subject: "Verify your CreateSphere account",
        html: `
          <h2>Welcome back to CreateSphere 🎨</h2>
          <p>It looks like you've already started signing up. Please verify your email to activate your account.</p>
          <div style="margin: 20px 0;">
            <a href="${verifyLink}" 
               style="background-color: #1677ff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Verify Email
            </a>
          </div>
          <p>This link expires in ${verifyExpiryMinutes} minutes.</p>
        `,
      }).catch(err => console.error("Resend on signup failed:", err));

      return {
        _id: existing._id,
        name: existing.name,
        email: existing.email,
        message: "Account already registered. A new verification link has been sent to your email."
      };
    }
  }

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

  // ✅ Send email verification link in the background (prevent timeouts)
  const verifyLink = `${CLIENT_URL}/verify-email?token=${rawToken}&email=${encodeURIComponent(user.email)}`;

  sendMail({
    to: user.email,
    subject: "Verify your CreateSphere account",
    html: `
      <h2>Welcome to CreateSphere 🎨</h2>
      <p>Please verify your email to activate your account.</p>
      <div style="margin: 20px 0;">
        <a href="${verifyLink}" 
           style="background-color: #1677ff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
          Verify Email
        </a>
      </div>
      <p>This link expires in ${verifyExpiryMinutes} minutes.</p>
      <p>If the button above doesn't work, copy and paste this link: <br/> ${verifyLink}</p>
    `,
  }).catch(err => {
    console.error("Critical: Failed to send signup verification email to", email, err);
  });

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    onboardingStatus: user.onboardingStatus,
  };
};


/* =========================================================
   VERIFY EMAIL
========================================================= */
export const verifyEmail = async (token, email) => {
  if (!token) throw new Error("Verification token required");

  const hashed = crypto.createHash("sha256").update(token).digest("hex");

  let query = { emailVerificationToken: hashed };
  if (email) {
    query = { email: email.trim().toLowerCase() };
  }

  const user = await User.findOne(query).select("+emailVerificationToken +emailVerificationExpires");

  if (!user) {
    throw new Error("Invalid verification link or user not found");
  }

  // If we found by email, must verify token matches
  if (email && user.emailVerificationToken !== hashed) {
     // If user is already verified and token is null, it's fine
     if (user.emailVerified) {
       return { alreadyVerified: true };
     }
     throw new Error("Invalid or expired verification token");
  }

  if (user.emailVerified) {
    return { alreadyVerified: true };
  }

  if (user.emailVerificationExpires && user.emailVerificationExpires < new Date()) {
    throw new Error("Verification link has expired. Please request a new one.");
  }

  // ✅ Success - Update user
  user.emailVerified = true;
  user.emailVerificationToken = null;
  user.emailVerificationExpires = null;

  await user.save();

  return { verified: true };
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

  const verifyLink = `${CLIENT_URL}/verify-email?token=${rawToken}&email=${encodeURIComponent(user.email)}`;


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
  if (user.isBlocked) {
    if (user.status === "hidden") {
      throw new Error("This account has been hidden by admin");
    } else {
      throw new Error("This account has been blocked by admin");
    }
  }

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

  const resetLink = `${CLIENT_URL}/reset-password?token=${rawToken}&email=${encodeURIComponent(user.email)}`;

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
export const resetPassword = async (token, newPassword, email) => {
  if (!token) throw new Error("Reset token required");
  if (!newPassword || newPassword.length < 6) throw new Error("Password must be at least 6 characters");

  const hashed = crypto.createHash("sha256").update(token).digest("hex");

  let query = { passwordResetToken: hashed };
  if (email) {
    query = { email: email.trim().toLowerCase() };
  }

  const user = await User.findOne(query).select("+passwordResetToken +passwordResetExpires");

  if (!user) {
    throw new Error("Invalid reset link or user not found");
  }

  // Verify token matches if we found by email
  if (email && user.passwordResetToken !== hashed) {
    throw new Error("Invalid or expired reset token");
  }

  if (user.passwordResetExpires && user.passwordResetExpires < new Date()) {
    throw new Error("Reset link has expired");
  }

  user.password = await bcrypt.hash(newPassword, 10);
  user.passwordResetToken = null;
  user.passwordResetExpires = null;

  // Also verify email if they resetting password (logical)
  user.emailVerified = true;

  await user.save();

  return true;
};


/* -------------------------
   LOGOUT (stateless)
-------------------------- */
export const logoutUser = async () => true;
