"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { isExternalHref } from "@/lib/urls";
import { cn } from "@/lib/utils";
import type { NavItem } from "./nav";

function isActive(pathname: string, href: string): boolean {
  const path = href.split(/[?#]/)[0];
  if (!path || path === "/") return false;
  return pathname === path || pathname.startsWith(`${path}/`);
}

function NavLink({ item, pathname, className, onNavigate }: { item: NavItem; pathname: string; className?: string; onNavigate?: () => void }) {
  const active = isActive(pathname, item.href);
  if (isExternalHref(item.href)) {
    return (
      <a href={item.href} target="_blank" rel="noopener noreferrer" className={className}>
        {item.label}
        <span aria-hidden> ↗</span>
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    );
  }
  return (
    <Link href={item.href} className={className} aria-current={active ? "page" : undefined} data-active={active || undefined} onClick={onNavigate}>
      {item.label}
    </Link>
  );
}

export function HeaderNav({ items, name }: { items: NavItem[]; name: string }) {
  const pathname = usePathname() ?? "/";
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Close the mobile menu after client-side navigation.
  useEffect(() => {
    dialogRef.current?.close();
  }, [pathname]);

  const linkClass =
    "relative py-1 text-[0.9375rem] text-ink-2 transition-colors duration-fast hover:text-ink data-[active]:text-ink after:absolute after:inset-x-0 after:-bottom-[1.3rem] after:h-px after:bg-accent after:opacity-0 data-[active]:after:opacity-100";

  return (
    <>
      <nav aria-label="Primary" className="hidden items-center gap-7 md:flex">
        {items.map((item) => (
          <NavLink key={item.href + item.label} item={item} pathname={pathname} className={linkClass} />
        ))}
        <ThemeToggle className="-mr-2" />
      </nav>

      <div className="flex items-center gap-1 md:hidden">
        <ThemeToggle />
        <button
          type="button"
          className="inline-flex h-9 items-center gap-2 rounded-sm px-2 text-sm text-ink hover:bg-surface"
          aria-haspopup="dialog"
          onClick={() => dialogRef.current?.showModal()}
        >
          <Menu aria-hidden className="h-4 w-4" />
          Menu
        </button>
      </div>

      <dialog
        ref={dialogRef}
        aria-label="Site navigation"
        className="m-0 h-[100dvh] max-h-none w-screen max-w-none bg-paper p-0 text-ink backdrop:bg-paper/80"
        onClick={(e) => {
          if (e.target === dialogRef.current) dialogRef.current?.close();
        }}
      >
        <div className="container-page flex h-[var(--header-h)] items-center justify-between border-b border-rule">
          <span className="font-display text-[0.9375rem] font-semibold">{name}</span>
          <button
            type="button"
            className="inline-flex h-9 items-center gap-2 rounded-sm px-2 text-sm hover:bg-surface"
            onClick={() => dialogRef.current?.close()}
          >
            <X aria-hidden className="h-4 w-4" />
            Close
          </button>
        </div>
        <nav aria-label="Primary" className="container-page pt-6">
          <ul className="divide-y divide-rule border-b border-rule">
            {items.map((item) => (
              <li key={item.href + item.label}>
                <NavLink
                  item={item}
                  pathname={pathname}
                  onNavigate={() => dialogRef.current?.close()}
                  className={cn(
                    "flex items-baseline gap-4 py-4 font-display text-2xl font-medium tracking-tight text-ink data-[active]:text-accent",
                  )}
                />
              </li>
            ))}
          </ul>
        </nav>
      </dialog>
    </>
  );
}
