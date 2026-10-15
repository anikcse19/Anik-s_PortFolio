import { Schema } from "mongoose";
import { getModel } from "./_shared";

/** One document per settings key; values are validated with zod before writing. */
const settingSchema = new Schema(
  {
    key: { type: String, required: true, unique: true },
    value: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true, minimize: false },
);

export const SettingModel = getModel<{ key: string; value: unknown; createdAt: Date; updatedAt: Date }>("Setting", settingSchema);
