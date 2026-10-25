import "server-only";
import type { z } from "zod";
import { zodFieldErrors } from "@/lib/admin/errors";
import { hmac } from "@/lib/auth/crypto";
import { consumeRateLimit, RATE_LIMITS } from "@/lib/auth/rate-limit";
import { connectDB, isDatabaseConfigured } from "@/lib/db";
import { sendContactNotification } from "@/lib/mail";
import { MessageModel } from "@/lib/models";
import { contactMessageSchema, studioInquirySchema } from "@/lib/validation/content";

export type ContactFormState =
  | { status: "idle" }
  | { status: "success"; message: string }
  | { status: "error"; message: string; fieldErrors?: Record<string, string>; values?: Record<string, string> };

/** Submissions faster than this after the form rendered are almost certainly bots. */
const MIN_FILL_MS = 2500;

const CONTACT_FIELDS = ["name", "email", "subject", "message"] as const;
const INQUIRY_FIELDS = ["name", "email", "company", "service", "budget", "timeline", "message"] as const;

function readValues(formData: FormData, fields: readonly string[]): Record<string, string> {
  return Object.fromEntries(fields.map((f) => [f, String(formData.get(f) ?? "")]));
}

type MessageRecord = {
  name: string;
  email: string;
  subject: string;
  message: string;
  source: "portfolio" | "studio";
  details?: { company: string; service: string; budget: string; timeline: string };
};

/**
 * Shared pipeline for every public form: spam checks, validation, rate limit,
 * storage and the optional email notification. Messages are stored before any
 * email is attempted, so nothing is lost when SMTP is down or not configured.
 */
async function submitMessage<S extends z.ZodType<Record<string, string>>>(
  formData: FormData,
  clientIp: string,
  opts: { enabled: boolean; fields: readonly string[]; schema: S; toRecord: (data: z.infer<S>) => MessageRecord; successMessage: string },
): Promise<ContactFormState> {
  const values = readValues(formData, opts.fields);

  if (!opts.enabled) {
    return { status: "error", message: "This form is currently closed. Please use the email address on this page." };
  }
  if (!isDatabaseConfigured()) {
    return { status: "error", message: "This form is not available right now. Please reach out by email instead.", values };
  }

  // Honeypot: a visually hidden field humans never fill. Pretend success so bots learn nothing.
  const honeypot = String(formData.get("website") ?? "");
  // startedAt is set by the browser on first focus. It is absent without JavaScript,
  // in which case only the honeypot and rate limit apply.
  const startedAt = Number(formData.get("startedAt") || 0);
  const tooFast = Number.isFinite(startedAt) && startedAt > 0 && Date.now() - startedAt < MIN_FILL_MS;
  if (honeypot.trim() !== "" || tooFast) {
    return { status: "success", message: opts.successMessage };
  }

  const parsed = opts.schema.safeParse(values);
  if (!parsed.success) {
    return { status: "error", message: "Please check the highlighted fields.", fieldErrors: zodFieldErrors(parsed.error), values };
  }

  const ipHash = hmac(clientIp || "unknown");
  const limit = await consumeRateLimit(`contact:${ipHash}`, RATE_LIMITS.contactPerIp.limit, RATE_LIMITS.contactPerIp.windowSeconds);
  if (!limit.allowed) {
    const minutes = Math.ceil(limit.retryAfterSeconds / 60);
    return { status: "error", message: `Too many messages from your connection. Please try again in about ${minutes} minutes.`, values };
  }

  const record = opts.toRecord(parsed.data);
  await connectDB();
  const stored = await MessageModel.create({ ...record, ipHash, delivery: "stored" });

  try {
    const sent = await sendContactNotification(record);
    if (sent) await MessageModel.updateOne({ _id: stored._id }, { $set: { delivery: "emailed" } });
  } catch (error) {
    // The message is safely stored; log only the error class, never message contents or credentials.
    console.error("Contact notification failed:", error instanceof Error ? error.name : "unknown error");
    await MessageModel.updateOne({ _id: stored._id }, { $set: { delivery: "email_failed" } });
  }

  return { status: "success", message: opts.successMessage };
}

export async function handleContactSubmission(formData: FormData, clientIp: string, formEnabled: boolean): Promise<ContactFormState> {
  return submitMessage(formData, clientIp, {
    enabled: formEnabled,
    fields: CONTACT_FIELDS,
    schema: contactMessageSchema,
    toRecord: (data) => ({ ...data, source: "portfolio" }),
    successMessage: "Thanks — your message has been received.",
  });
}

export async function handleStudioInquiry(formData: FormData, clientIp: string): Promise<ContactFormState> {
  return submitMessage(formData, clientIp, {
    enabled: true,
    fields: INQUIRY_FIELDS,
    schema: studioInquirySchema,
    toRecord: ({ company, service, budget, timeline, ...rest }) => ({
      ...rest,
      subject: `Project inquiry${service ? `: ${service}` : ""}${company ? ` — ${company}` : ""}`.slice(0, 160),
      source: "studio",
      details: { company, service, budget, timeline },
    }),
    successMessage: "Thanks — your project inquiry has been received.",
  });
}

export function formValues(formData: FormData, studio = false): Record<string, string> {
  return readValues(formData, studio ? INQUIRY_FIELDS : CONTACT_FIELDS);
}
