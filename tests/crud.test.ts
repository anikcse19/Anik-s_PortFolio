import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { canConnect, closeTestDatabase, useTestDatabase } from "./db";

const dbAvailable = await canConnect();

// next/cache's unstable_cache needs the Next runtime; for these tests it is a pass-through.
vi.mock("next/cache", () => ({ unstable_cache: (fn: unknown) => fn, updateTag: () => undefined, revalidateTag: () => undefined }));

describe.skipIf(!dbAvailable)("content CRUD and publication rules (MongoDB)", () => {
  beforeAll(useTestDatabase);
  afterAll(closeTestDatabase);

  const project = { title: "Alpha", slug: "alpha", summary: "Summary", type: "personal", overview: "<p>Hi</p><script>x</script>" };

  it("creates drafts, sanitizes HTML and enforces unique slugs", async () => {
    const { createDocument } = await import("@/lib/admin/crud");
    const created = await createDocument<{ id: string; status: string; overview: string; publishedAt: string | null }>("projects", project);
    expect(created.status).toBe("draft");
    expect(created.overview).toBe("<p>Hi</p>");
    expect(created.publishedAt).toBeNull();
    await expect(createDocument("projects", project)).rejects.toMatchObject({ name: "ConflictError" });
  });

  it("rejects invalid input with field errors", async () => {
    const { createDocument } = await import("@/lib/admin/crud");
    await expect(createDocument("projects", { ...project, slug: "Bad slug" })).rejects.toMatchObject({ name: "ValidationError", fieldErrors: { slug: expect.any(String) } });
  });

  it("never exposes drafts through the public data layer", async () => {
    const { getPublishedProjects, getProjectBySlug } = await import("@/lib/data/public");
    expect(await getPublishedProjects()).toEqual([]);
    expect(await getProjectBySlug("alpha")).toBeNull();
  });

  it("publishes, sets publishedAt and appears publicly; unpublish hides it again", async () => {
    const { listDocuments, setDocumentStatus } = await import("@/lib/admin/crud");
    const { getPublishedProjects } = await import("@/lib/data/public");
    const [{ id }] = (await listDocuments<{ id: string }>("projects")).items;
    await setDocumentStatus("projects", id, "published");
    const published = await getPublishedProjects();
    expect(published.map((p) => p.slug)).toEqual(["alpha"]);
    expect(published[0].publishedAt).not.toBeNull();
    await setDocumentStatus("projects", id, "draft");
    expect(await getPublishedProjects()).toEqual([]);
  });

  it("detects concurrent edits", async () => {
    const { listDocuments, updateDocument } = await import("@/lib/admin/crud");
    const [doc] = (await listDocuments<{ id: string; updatedAt: string }>("projects")).items;
    await updateDocument("projects", doc.id, { ...project, title: "Alpha 2" }, doc.updatedAt);
    await expect(updateDocument("projects", doc.id, { ...project, title: "Stale" }, doc.updatedAt)).rejects.toMatchObject({ name: "ConflictError" });
  });

  it("deletes and cleans up references", async () => {
    const { createDocument, deleteDocument, getDocument, listDocuments } = await import("@/lib/admin/crud");
    const [p] = (await listDocuments<{ id: string }>("projects")).items;
    const cs = await createDocument<{ id: string }>("caseStudies", { title: "CS", slug: "cs", summary: "S", kind: "exploration", relatedProjectId: p.id });
    await deleteDocument("projects", p.id);
    expect(await getDocument("projects", p.id)).toBeNull();
    expect((await getDocument<{ relatedProjectId: string | null }>("caseStudies", cs.id))?.relatedProjectId).toBeNull();
    await expect(deleteDocument("projects", p.id)).rejects.toMatchObject({ name: "NotFoundError" });
  });
});
