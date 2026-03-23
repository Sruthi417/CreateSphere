import nodemailer from "nodemailer";
import { EMAIL_USER, EMAIL_PASS } from "./config/env.js";

async function testGmail() {
  console.log("Using credentials:", EMAIL_USER, EMAIL_PASS ? "********" : "MISSING");
  
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
    connectionTimeout: 10000,
  });

  try {
    console.log("Attempting to verify transporter...");
    await transporter.verify();
    console.log("Transporter verified successfully!");

    console.log("Attempting to send test email to createsphere.it@gmail.com...");
    const info = await transporter.sendMail({
      from: `"CreateSphere Test" <${EMAIL_USER}>`,
      to: "createsphere.it@gmail.com",
      subject: "Test Diagnostic Email",
      text: "If you receive this, your Gmail SMTP configuration is working correctly.",
      html: "<b>If you receive this, your Gmail SMTP configuration is working correctly.</b>",
    });

    console.log("Email sent successfully!");
    console.log("Message ID:", info.messageId);
    process.exit(0);
  } catch (error) {
    console.error("Diagnostic Failed!");
    console.error("Error Message:", error.message);
    console.error("Full Error:", error);
    process.exit(1);
  }
}

testGmail();
