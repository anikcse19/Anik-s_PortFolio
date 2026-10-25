"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { buttonClasses } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { isExternalHref, isFileHref } from "@/lib/urls";
import { cn } from "@/lib/utils";
import type { NavItem } from "./nav";

function isActive(pathname: string, href: string, homeHref: string): boolean {
  const path = href.split(/[?#]/)[0];
  if (!path || path === "/" || path === homeHref) return false;
  return pathname === path || pathname.startsWith(`${path}/`);
}

function NavLink({ item, active, className, onNavigate }: { item: NavItem; active: boolean; className?: string; onNavigate?: () => void }) {
  if (isExternalHref(item.href) || isFileHref(item.href) || item.href.startsWith("mailto:")) {
    const external = isExternalHref(item.href) || isFileHref(item.href);
    return (
      <a href={item.href} className={className} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
        {item.label}
        {external ? <span aria-hidden> ↗</span> : null}
        {external ? <span className="sr-only"> (opens in a new tab)</span> : null}
      </a>
    );
  }
  return (
    <Link href={item.href} className={className} aria-current={active ? "page" : undefined} data-active={active || undefined} onClick={onNavigate}>
      {item.label}
    </Link>
  );
}

export function HeaderNav({ items, name, homeHref = "/", cta }: { items: NavItem[]; name: string; homeHref?: string; cta?: NavItem | null }) {
  const pathname = usePathname() ?? homeHref;
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Close the mobile menu after client-side navigation.
  useEffect(() => {
    dialogRef.current?.close();
  }, [pathname]);

  const linkClass =
    "rounded-md px-3 py-1.5 text-[0.9375rem] text-ink-2 transition-colors duration-fast hover:bg-surface hover:text-ink data-[active]:bg-surface data-[active]:font-medium data-[active]:text-ink";

  return (
    <>
      <div className="hidden items-center gap-1 md:flex">
        <nav aria-label="Primary" className="flex items-center gap-0.5">
          {items.map((item) => (
            <NavLink key={item.href + item.label} item={item} active={isActive(pathname, item.href, homeHref)} className={linkClass} />
          ))}
        </nav>
        <ThemeToggle className="ml-1" />
        {cta ? <NavLink item={cta} active={false} className={buttonClasses("primary", "sm", "ml-2 h-9 px-4")} /> : null}
      </div>

      <div className="flex items-center gap-1 md:hidden">
        <ThemeToggle />
        <button
          type="button"
          className="inline-flex h-9 items-center gap-2 rounded-md px-2.5 text-sm text-ink hover:bg-surface"
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
          <button type="button" className="inline-flex h-9 items-center gap-2 rounded-md px-2.5 text-sm hover:bg-surface" onClick={() => dialogRef.current?.close()}>
            <X aria-hidden className="h-4 w-4" />
            Close
          </button>
        </div>
        <nav aria-label="Primary" className="container-page pt-4">
          <ul className="divide-y divide-rule">
            {items.map((item) => (
              <li key={item.href + item.label}>
                <NavLink
                  item={item}
                  active={isActive(pathname, item.href, homeHref)}
                  onNavigate={() => dialogRef.current?.close()}
                  className={cn("flex py-4 font-display text-2xl font-medium tracking-tight text-ink data-[active]:text-accent")}
                />
              </li>
            ))}
          </ul>
          {cta ? (
            <NavLink item={cta} active={false} onNavigate={() => dialogRef.current?.close()} className={buttonClasses("primary", "md", "mt-8 w-full")} />
          ) : null}
        </nav>
      </dialog>
    </>
  );
}
