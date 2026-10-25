import { Schema } from "mongoose";
import { getModel } from "./_shared";

/**
 * When each item was last copied to an external profile (LinkedIn, GitHub),
 * and the fingerprint of the text at that moment. See lib/profile-sync.ts.
 */
const syncStateSchema = new Schema(
  {
    key: { type: String, required: true, unique: true },
    hash: { type: String, required: true },
    /** Item title at sync time, so removed items can still be named. */
    title: { type: String, default: "" },
    syncedAt: { type: Date, required: true },
  },
  { timestamps: false, strict: true },
);

export const SyncStateModel = getModel<{ key: string; hash: string; title: string; syncedAt: Date }>("SyncState", syncStateSchema);
