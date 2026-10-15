import { ExternalLink, LogOut, Menu } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { logout } from "@/app/admin/_actions/auth";
import { AdminNav } from "@/components/admin/admin-nav";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { requireAdmin } from "@/lib/auth/session";
import { connectDB } from "@/lib/db";
import { MessageModel } from "@/lib/models";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Admin" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const admin = await requireAdmin();
  await connectDB();
  const unread = await MessageModel.countDocuments({ read: false });

  const sidebar = (
    <>
      <AdminNav unread={unread} />
      <div className="mt-8 space-y-3 border-t border-rule px-3 pt-4 text-sm">
        <p className="truncate text-ink-3" title={admin.email}>
          {admin.name || admin.email}
        </p>
        <div className="flex items-center gap-2">
          <Link href="/" target="_blank" className="inline-flex items-center gap-1 text-ink-2 hover:text-ink">
            View site <ExternalLink className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </div>
        <form action={logout}>
          <button type="submit" className="inline-flex items-center gap-1.5 text-ink-2 hover:text-danger">
            <LogOut className="h-4 w-4" aria-hidden /> Sign out
          </button>
        </form>
      </div>
    </>
  );

  return (
    <div className="min-h-[100dvh] lg:grid lg:grid-cols-[15.5rem_minmax(0,1fr)]">
      <a href="#admin-main" className="skip-link">
        Skip to content
      </a>
      <aside className="hidden border-r border-rule lg:block">
        <div className="sticky top-0 max-h-[100dvh] overflow-y-auto py-5">
          <div className="mb-6 flex items-center justify-between px-6">
            <Link href="/admin" className="font-display font-semibold">
              Portfolio CMS
            </Link>
            <ThemeToggle />
          </div>
          <div className="px-3">{sidebar}</div>
        </div>
      </aside>

      <details className="group border-b border-rule lg:hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3">
          <span className="font-display font-semibold">Portfolio CMS</span>
          <span className="inline-flex items-center gap-1.5 text-sm text-ink-2">
            <Menu className="h-4 w-4" aria-hidden /> Menu
          </span>
        </summary>
        <div className="border-t border-rule px-1 py-4">{sidebar}</div>
      </details>

      <div id="admin-main" className="min-w-0 px-4 pb-24 md:px-8">
        {children}
      </div>
    </div>
  );
}
