import "server-only";
import nodemailer from "nodemailer";
import { getEnv, isMailConfigured } from "@/lib/env";

/**
 * Optional SMTP notification for contact-form submissions. Messages are always
 * stored in the database first, so nothing is lost when email is not configured.
 * Any SMTP provider works (Gmail app password, Brevo, Resend SMTP, Zoho, ...).
 */

export { isMailConfigured };

export async function sendContactNotification(input: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): Promise<boolean> {
  if (!isMailConfigured()) return false;
  const env = getEnv();
  const port = env.SMTP_PORT ?? 587;
  const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port,
    secure: env.SMTP_SECURE ? env.SMTP_SECURE === "true" : port === 465,
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
    connectionTimeout: 8000,
    greetingTimeout: 8000,
    socketTimeout: 10000,
  });

  const subject = `Portfolio contact: ${input.subject || input.name}`.replace(/[\r\n]+/g, " ").slice(0, 200);
  await transporter.sendMail({
    from: env.CONTACT_FROM_EMAIL || env.SMTP_USER,
    to: env.CONTACT_TO_EMAIL,
    // Reply goes to the visitor; nodemailer encodes the address safely.
    replyTo: { name: input.name.replace(/[\r\n"]/g, " "), address: input.email },
    subject,
    // Plain text only: no visitor-supplied HTML is ever rendered in the email.
    text: [
      `From: ${input.name} <${input.email}>`,
      input.subject ? `Subject: ${input.subject}` : "",
      "",
      input.message,
      "",
      "— Sent from the contact form on your portfolio. Also saved in Admin › Messages.",
    ]
      .filter((line, i) => line !== "" || i > 1)
      .join("\n"),
  });
  return true;
}
