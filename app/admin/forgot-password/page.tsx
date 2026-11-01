import type { Metadata } from "next";
import Link from "next/link";
import { isSmtpConfigured } from "@/lib/env";
import { ForgotPasswordForm } from "./forgot-password-form";

export const metadata: Metadata = { title: "Forgot password", robots: { index: false, follow: false } };

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-[100dvh] items-center justify-center px-5 py-16">
      <div className="w-full max-w-sm">
        <p className="label">Admin</p>
        <h1 className="mt-3 text-title-2 font-semibold">Forgot password</h1>
        <p className="mt-2 text-sm text-ink-3">Enter your admin email and we will send you a link to choose a new password.</p>
        {!isSmtpConfigured() ? (
          <p role="alert" className="mt-6 border-l-2 border-warning bg-surface px-3 py-2 text-sm">
            Email (SMTP_HOST, SMTP_USER, SMTP_PASS) is not configured, so reset links cannot be sent. Reset the password from a terminal
            instead: <code>npm run admin:create -- --reset</code>
          </p>
        ) : null}
        <div className="mt-8">
          <ForgotPasswordForm />
        </div>
        <p className="mt-6 text-sm">
          <Link href="/admin/login" className="text-ink-3 underline underline-offset-4 hover:text-ink">
            Back to sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
