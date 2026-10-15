import { connectDB } from "@/lib/db";
import { ProjectModel } from "@/lib/models";

/** Project options for relation selects (admin only; includes drafts, labelled). */
export async function projectOptions(): Promise<{ id: string; label: string }[]> {
  await connectDB();
  const docs = await ProjectModel.find({}).select("title status").sort({ sortOrder: 1, createdAt: -1 }).limit(300).lean();
  return docs.map((d) => ({ id: String(d._id), label: `${String(d.title)}${d.status === "draft" ? " (draft)" : ""}` }));
}
