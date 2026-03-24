import { config } from "dotenv";

config({
  path: `.env.${process.env.NODE_ENV || "development"}.local`,
});

export const {
  PORT,
  NODE_ENV,
  db_URI,
  SERVER_URL,
  JWT_SECRET,
  JWT_EXPIRY,
  GEMINI_API_KEY,
  HF_API_KEY,
  RESEND_API_KEY,
  CLIENT_URL,
  EMAIL_VERIFY_EXPIRY_MIN,
  RESET_PASS_EXPIRY_MIN,
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET
} = process.env;
