import { Notice } from "@/components/admin/fields";
import { PageHeader } from "@/components/admin/list-page";
import { MessageList } from "@/components/admin/message-list";
import { buttonClasses } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth/session";
import { connectDB } from "@/lib/db";
import { isMailConfigured } from "@/lib/env";
import { MessageModel } from "@/lib/models";
import { serializeDoc } from "@/lib/serialize";
import type { ContactMessage } from "@/lib/types";
import Link from "next/link";

export const metadata = { title: "Messages" };

const PAGE_SIZE = 30;

export default async function MessagesPage({ searchParams }: PageProps<"/admin/messages">) {
  await requireAdmin();
  const params = await searchParams;
  const page = Math.max(1, Number.parseInt(String(params.page ?? "1"), 10) || 1);
  const filter = params.filter === "unread" ? { read: false } : {};
  await connectDB();
  const [docs, total] = await Promise.all([
    MessageModel.find(filter).select("-ipHash").sort({ createdAt: -1 }).skip((page - 1) * PAGE_SIZE).limit(PAGE_SIZE).lean(),
    MessageModel.countDocuments(filter),
  ]);
  const messages = docs.map((d) => serializeDoc<ContactMessage>(d));
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const qs = (p: number) => `/admin/messages?${new URLSearchParams({ ...(params.filter === "unread" ? { filter: "unread" } : {}), ...(p > 1 ? { page: String(p) } : {}) })}`;

  return (
    <>
      <PageHeader
        title="Messages"
        description="Submissions from the portfolio contact form and studio project inquiries. Messages are stored even when email delivery is not configured."
        action={
          <div className="flex gap-2 text-sm">
            <Link href="/admin/messages" className={buttonClasses(params.filter === "unread" ? "ghost" : "secondary", "sm")}>
              All
            </Link>
            <Link href="/admin/messages?filter=unread" className={buttonClasses(params.filter === "unread" ? "secondary" : "ghost", "sm")}>
              Unread
            </Link>
          </div>
        }
      />
      {!isMailConfigured() ? (
        <div className="my-4">
          <Notice tone="warning">Email notifications are off (SMTP not configured). Check this inbox for new messages.</Notice>
        </div>
      ) : null}
      <div className="mt-4">
        <MessageList messages={messages} />
      </div>
      {pages > 1 ? (
        <nav aria-label="Pagination" className="flex justify-between py-4 text-sm">
          <span className="text-ink-3">
            Page {page} of {pages}
          </span>
          <div className="flex gap-2">
            {page > 1 ? <Link className={buttonClasses("secondary", "sm")} href={qs(page - 1)}>Previous</Link> : null}
            {page < pages ? <Link className={buttonClasses("secondary", "sm")} href={qs(page + 1)}>Next</Link> : null}
          </div>
        </nav>
      ) : null}
    </>
  );
}
