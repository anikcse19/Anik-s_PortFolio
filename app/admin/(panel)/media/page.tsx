import { ListToolbar, PageHeader, Pagination, readListQuery } from "@/components/admin/list-page";
import { MediaManager } from "@/components/admin/media-manager";
import { listDocuments } from "@/lib/admin/crud";
import { requireAdmin } from "@/lib/auth/session";
import type { Media } from "@/lib/types";

export const metadata = { title: "Images" };

export default async function MediaPage({ searchParams }: PageProps<"/admin/media">) {
  await requireAdmin();
  const query = readListQuery(await searchParams);
  const result = await listDocuments<Media>("media", { ...query, pageSize: 24 });
  return (
    <>
      <PageHeader
        title="Images"
        description="A library of externally hosted image URLs. Host images on a free service that allows direct linking (e.g. GitHub, Cloudinary free tier, ImgBB) or commit them under /public."
      />
      <ListToolbar basePath="/admin/media" query={query} withStatus={false} />
      <MediaManager items={result.items} />
      <Pagination basePath="/admin/media" query={query} result={result} />
    </>
  );
}
