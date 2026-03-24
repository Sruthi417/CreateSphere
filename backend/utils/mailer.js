import { Resend } from "resend";
import { RESEND_API_KEY } from "../config/env.js";

const resend = new Resend(RESEND_API_KEY);

export const sendMail = async ({ to, subject, html }) => {
  try {
    const { data, error } = await resend.emails.send({
      from: "CreateSphere <no-reply@quickbay.in>",
      to,
      subject,
      html,
    });

    if (error) {
      if (error.name === "rate_limit_exceeded") {
        console.warn("Resend rate limit exceeded. Consider upgrading or slowing down requests.");
      }
      console.error("Resend error:", error);
      throw new Error(error.message);
    }

    return data;
  } catch (err) {
    console.error("Failed to send email via Resend:", err);
    throw err;
  }
};
