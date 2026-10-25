import { LockKeyhole } from "lucide-react";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getGatePassword } from "@/lib/env";
import { parseZone, safeZoneTarget, ZONE_COOKIE, ZONE_HOME } from "@/lib/zones";
import { UnlockForm } from "./unlock-form";

export const metadata: Metadata = { title: { absolute: "Password required" }, robots: { index: false, follow: false } };

/**
 * Neutral password screen shown when a visitor crosses between the portfolio and
 * the studio. It deliberately says nothing about what is on the other side.
 */
export default async function UnlockPage({ searchParams }: PageProps<"/unlock">) {
  const params = await searchParams;
  const current = parseZone((await cookies()).get(ZONE_COOKIE)?.value);
  const target = safeZoneTarget(Array.isArray(params.next) ? params.next[0] : params.next);
  const backHref = ZONE_HOME[current ?? "portfolio"];

  // Nothing to unlock: the destination is already in the visitor's zone (or they have no zone yet).
  if (target && (!current || current === target.zone)) redirect(target.path);

  const configured = getGatePassword() !== null;

  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-paper px-5 py-16">
      <div className="w-full max-w-sm">
        <div className="rounded-2xl border border-rule bg-surface/60 p-7 shadow-sm sm:p-8">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-rule bg-paper text-ink">
            <LockKeyhole aria-hidden className="h-5 w-5" />
          </span>
          <h1 className="mt-6 text-2xl font-semibold tracking-tight">Password required</h1>
          <p className="mt-2 text-[0.9375rem] text-ink-2">This area is private. Enter the password to continue.</p>
          <div className="mt-7">
            {target ? (
              <>
                {!configured ? (
                  <p role="status" className="mb-4 rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-sm text-ink">
                    Access is not configured on this site yet.
                  </p>
                ) : null}
                <UnlockForm next={target.path} disabled={!configured} />
              </>
            ) : (
              <p className="text-sm text-ink-2">This link is not valid.</p>
            )}
          </div>
        </div>
        <p className="mt-6 text-center text-sm">
          <Link href={backHref} className="text-ink-3 transition-colors duration-fast hover:text-ink">
            ← Go back
          </Link>
        </p>
      </div>
    </main>
  );
}
