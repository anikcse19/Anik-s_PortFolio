import "server-only";
import { zodFieldErrors } from "@/lib/admin/errors";
import { hmac } from "@/lib/auth/crypto";
import { consumeRateLimit, RATE_LIMITS } from "@/lib/auth/rate-limit";
import { connectDB, isDatabaseConfigured } from "@/lib/db";
import { sendContactNotification } from "@/lib/mail";
import { MessageModel } from "@/lib/models";
import { contactMessageSchema } from "@/lib/validation/content";

export type ContactFormState =
  | { status: "idle" }
  | { status: "success"; message: string }
  | { status: "error"; message: string; fieldErrors?: Record<string, string>; values?: Record<string, string> };

/** Submissions faster than this after the form rendered are almost certainly bots. */
const MIN_FILL_MS = 2500;

export async function handleContactSubmission(formData: FormData, clientIp: string, formEnabled: boolean): Promise<ContactFormState> {
  const values = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    subject: String(formData.get("subject") ?? ""),
    message: String(formData.get("message") ?? ""),
  };

  if (!formEnabled) {
    return { status: "error", message: "The contact form is currently closed. Please use the email address on this page." };
  }
  if (!isDatabaseConfigured()) {
    return { status: "error", message: "The contact form is not available right now. Please reach out by email instead.", values };
  }

  // Honeypot: a visually hidden field humans never fill. Pretend success so bots learn nothing.
  const honeypot = String(formData.get("website") ?? "");
  // startedAt is set by the browser on first focus. It is absent without JavaScript,
  // in which case only the honeypot and rate limit apply.
  const startedAt = Number(formData.get("startedAt") || 0);
  const tooFast = Number.isFinite(startedAt) && startedAt > 0 && Date.now() - startedAt < MIN_FILL_MS;
  if (honeypot.trim() !== "" || tooFast) {
    return { status: "success", message: "Thanks — your message has been received." };
  }

  const parsed = contactMessageSchema.safeParse(values);
  if (!parsed.success) {
    return { status: "error", message: "Please check the highlighted fields.", fieldErrors: zodFieldErrors(parsed.error), values };
  }

  const ipHash = hmac(clientIp || "unknown");
  const limit = await consumeRateLimit(`contact:${ipHash}`, RATE_LIMITS.contactPerIp.limit, RATE_LIMITS.contactPerIp.windowSeconds);
  if (!limit.allowed) {
    const minutes = Math.ceil(limit.retryAfterSeconds / 60);
    return { status: "error", message: `Too many messages from your connection. Please try again in about ${minutes} minutes.`, values };
  }

  await connectDB();
  const stored = await MessageModel.create({ ...parsed.data, ipHash, delivery: "stored" });

  try {
    const sent = await sendContactNotification(parsed.data);
    if (sent) await MessageModel.updateOne({ _id: stored._id }, { $set: { delivery: "emailed" } });
  } catch (error) {
    // The message is safely stored; log only the error class, never message contents or credentials.
    console.error("Contact notification failed:", error instanceof Error ? error.name : "unknown error");
    await MessageModel.updateOne({ _id: stored._id }, { $set: { delivery: "email_failed" } });
  }

  return { status: "success", message: "Thanks — your message has been received." };
}
