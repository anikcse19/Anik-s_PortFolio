import { hashPassword, validatePasswordStrength } from "@/lib/auth/password";
import { AdminModel, SessionModel } from "@/lib/models";

/** Creates the admin, or resets the password of an existing one (signing out all sessions). */
export async function provisionAdmin(input: { email: string; name: string; password: string; allowReset: boolean }): Promise<"created" | "reset" | "exists"> {
  const email = input.email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("ADMIN_EMAIL is not a valid email address.");
  const weakness = validatePasswordStrength(input.password, email);
  if (weakness) throw new Error(`ADMIN_PASSWORD is too weak: ${weakness}`);

  const existing = await AdminModel.findOne({ email });
  if (existing && !input.allowReset) return "exists";
  const passwordHash = await hashPassword(input.password);
  if (existing) {
    await AdminModel.updateOne({ _id: existing._id }, { $set: { passwordHash, passwordChangedAt: new Date(), ...(input.name ? { name: input.name } : {}) } });
    await SessionModel.deleteMany({ adminId: existing._id });
    return "reset";
  }
  await AdminModel.create({ email, name: input.name, passwordHash });
  return "created";
}
