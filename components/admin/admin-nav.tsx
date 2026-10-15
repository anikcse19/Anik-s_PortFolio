"use client";

import {
  BookOpenText,
  Briefcase,
  FileText,
  FolderKanban,
  Gauge,
  Home,
  Images,
  Inbox,
  Layers,
  Navigation,
  Palette,
  Search,
  Shield,
  SquareUser,
  UserRound,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const GROUPS = [
  { label: "Overview", items: [{ href: "/admin", label: "Dashboard", icon: Gauge }] },
  {
    label: "Content",
    items: [
      { href: "/admin/projects", label: "Projects", icon: FolderKanban },
      { href: "/admin/case-studies", label: "Case studies", icon: Layers },
      { href: "/admin/articles", label: "Articles", icon: FileText },
      { href: "/admin/experience", label: "Experience", icon: Briefcase },
      { href: "/admin/skills", label: "Skills", icon: Wrench },
      { href: "/admin/about", label: "About page", icon: BookOpenText },
    ],
  },
  {
    label: "Site",
    items: [
      { href: "/admin/homepage", label: "Homepage", icon: Home },
      { href: "/admin/profile", label: "Profile & hero", icon: UserRound },
      { href: "/admin/navigation", label: "Navigation & footer", icon: Navigation },
      { href: "/admin/contact", label: "Contact & social", icon: SquareUser },
      { href: "/admin/seo", label: "SEO", icon: Search },
      { href: "/admin/appearance", label: "Appearance", icon: Palette },
    ],
  },
  {
    label: "Library",
    items: [
      { href: "/admin/media", label: "Images", icon: Images },
      { href: "/admin/messages", label: "Messages", icon: Inbox },
    ],
  },
  { label: "Account", items: [{ href: "/admin/security", label: "Security", icon: Shield }] },
];

export function AdminNav({ unread }: { unread: number }) {
  const pathname = usePathname() ?? "/admin";
  return (
    <nav aria-label="Admin" className="space-y-6">
      {GROUPS.map((group) => (
        <div key={group.label}>
          <p className="label mb-2 px-3">{group.label}</p>
          <ul className="space-y-0.5">
            {group.items.map((item) => {
              const active = item.href === "/admin" ? pathname === "/admin" : pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-2.5 rounded-sm px-3 py-1.5 text-sm transition-colors duration-fast",
                      active ? "bg-surface-2 font-medium text-ink" : "text-ink-2 hover:bg-surface hover:text-ink",
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" aria-hidden />
                    <span className="flex-1">{item.label}</span>
                    {item.href === "/admin/messages" && unread > 0 ? (
                      <span className="rounded-sm bg-accent px-1.5 font-mono text-[0.6875rem] text-accent-ink">
                        {unread}
                        <span className="sr-only"> unread</span>
                      </span>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
