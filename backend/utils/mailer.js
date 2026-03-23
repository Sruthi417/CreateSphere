import nodemailer from "nodemailer";
import { EMAIL_USER, EMAIL_PASS } from "../config/env.js";

export const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
  connectionTimeout: 10000, // 10 seconds
  greetingTimeout: 10000,
  socketTimeout: 30000,
  tls: {
    rejectUnauthorized: false
  }
});

export const sendMail = async ({ to, subject, html }) => {
  return transporter.sendMail({
    from: `"CreateSphere" <${EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};
