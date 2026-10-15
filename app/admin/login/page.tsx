import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth/session";
import { isDatabaseConfigured } from "@/lib/db";
import { safeAdminRedirect } from "@/lib/urls";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Sign in", robots: { index: false, follow: false } };

export default async function LoginPage({ searchParams }: PageProps<"/admin/login">) {
  const params = await searchParams;
  const next = safeAdminRedirect(typeof params.next === "string" ? params.next : undefined);
  if (isDatabaseConfigured() && (await getCurrentAdmin())) redirect(next);

  return (
    <main className="flex min-h-[100dvh] items-center justify-center px-5 py-16">
      <div className="w-full max-w-sm">
        <p className="label">Admin</p>
        <h1 className="mt-3 text-title-2 font-semibold">Sign in</h1>
        <p className="mt-2 text-sm text-ink-3">Content management for this portfolio. There is no public registration.</p>
        {params.signedOut ? (
          <p role="status" className="mt-6 text-sm text-success">
            You have been signed out.
          </p>
        ) : null}
        {!isDatabaseConfigured() ? (
          <p role="alert" className="mt-6 border-l-2 border-warning bg-surface px-3 py-2 text-sm">
            MONGODB_URI is not set, so sign-in is unavailable. See the deployment guide in the README.
          </p>
        ) : null}
        <div className="mt-8">
          <LoginForm next={next} />
        </div>
      </div>
    </main>
  );
}
