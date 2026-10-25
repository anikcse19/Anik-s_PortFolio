import { Schema } from "mongoose";
import { baseOptions, getModel } from "./_shared";

const messageSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    subject: { type: String, default: "" },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    /** "stored" = saved only, "emailed" = notification sent, "email_failed" = SMTP error. */
    delivery: { type: String, enum: ["stored", "emailed", "email_failed"], default: "stored" },
    ipHash: { type: String, default: "" },
    /** Which presentation the message came from: the portfolio contact form or a studio project inquiry. */
    source: { type: String, enum: ["portfolio", "studio"], default: "portfolio" },
    /** Project details for studio inquiries (company, service, budget, timeline). */
    details: {
      company: { type: String, default: "" },
      service: { type: String, default: "" },
      budget: { type: String, default: "" },
      timeline: { type: String, default: "" },
    },
  },
  baseOptions,
);
messageSchema.index({ createdAt: -1 });
messageSchema.index({ read: 1, createdAt: -1 });

export const MessageModel = getModel<Record<string, unknown>>("Message", messageSchema);
