import type { Metadata } from "next";
import Link from "next/link";
import { isResetTokenValid } from "@/lib/auth/password-reset";
import { isDatabaseConfigured } from "@/lib/db";
import { ResetPasswordForm } from "./reset-password-form";

export const metadata: Metadata = {
  title: "Reset password",
  robots: { index: false, follow: false },
  // The token is in the URL; never send it to another origin.
  referrer: "no-referrer",
};

export default async function ResetPasswordPage({ searchParams }: PageProps<"/admin/reset-password">) {
  const params = await searchParams;
  const token = typeof params.token === "string" ? params.token : "";
  const valid = isDatabaseConfigured() && (await isResetTokenValid(token));

  return (
    <main className="flex min-h-[100dvh] items-center justify-center px-5 py-16">
      <div className="w-full max-w-sm">
        <p className="label">Admin</p>
        <h1 className="mt-3 text-title-2 font-semibold">Choose a new password</h1>
        {valid ? (
          <>
            <p className="mt-2 text-sm text-ink-3">At least 12 characters. A long passphrase is best. Every device will be signed out.</p>
            <div className="mt-8">
              <ResetPasswordForm token={token} />
            </div>
          </>
        ) : (
          <>
            <p role="alert" className="mt-6 border-l-2 border-danger bg-surface px-3 py-2 text-sm text-ink">
              This reset link is invalid or has expired.
            </p>
            <p className="mt-6 text-sm">
              <Link href="/admin/forgot-password" className="text-ink-3 underline underline-offset-4 hover:text-ink">
                Request a new link
              </Link>
            </p>
          </>
        )}
      </div>
    </main>
  );
}
