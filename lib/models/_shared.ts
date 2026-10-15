import mongoose, { Schema, type Model } from "mongoose";

/** Reuses compiled models across hot reloads / warm serverless invocations. */
export function getModel<T>(name: string, schema: object): Model<T> {
  // `schema` is typed loosely on purpose: comparing Mongoose's inferred Schema
  // generics against `Schema` makes the TypeScript checker run out of memory.
  return (mongoose.models[name] as Model<T> | undefined) ?? mongoose.model<T>(name, schema as Schema<T>);
}

export const imageRefSchema = new Schema(
  { url: { type: String, required: true }, alt: { type: String, default: "" }, caption: { type: String, default: "" } },
  { _id: false },
);

export const seoSchema = new Schema(
  { title: { type: String, default: "" }, description: { type: String, default: "" }, ogImage: { type: String, default: "" } },
  { _id: false },
);

export const STATUS_VALUES = ["draft", "published"];

export const baseOptions = { timestamps: true, minimize: false, strict: true } as const;
