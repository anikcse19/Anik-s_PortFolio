"use server";

import { z } from "zod";
import { adminAction } from "@/lib/admin/action";
import { NotFoundError, ValidationError } from "@/lib/admin/errors";
import { connectDB } from "@/lib/db";
import { MessageModel } from "@/lib/models";
import type { ActionResult } from "@/lib/types";
import { objectIdSchema } from "@/lib/validation/common";

function id(value: unknown): string {
  const res = objectIdSchema.safeParse(value);
  if (!res.success) throw new ValidationError("Invalid request.");
  return res.data;
}

export async function setMessageReadAction(messageId: string, read: boolean): Promise<ActionResult> {
  return adminAction(async () => {
    await connectDB();
    const res = await MessageModel.updateOne({ _id: id(messageId) }, { $set: { read: z.boolean().parse(read) } });
    if (res.matchedCount === 0) throw new NotFoundError();
    return undefined;
  });
}

export async function deleteMessageAction(messageId: string): Promise<ActionResult> {
  return adminAction(async () => {
    await connectDB();
    const res = await MessageModel.deleteOne({ _id: id(messageId) });
    if (res.deletedCount === 0) throw new NotFoundError();
    return undefined;
  }, "Message deleted");
}
