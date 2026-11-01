"use client";

import { useActionState, useEffect } from "react";
import { login, type LoginState } from "@/app/admin/_actions/auth";
import { Button } from "@/components/ui/button";

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});
  useEffect(() => {
    if (state.redirectTo) window.location.replace(state.redirectTo);
  }, [state.redirectTo]);
  const busy = pending || Boolean(state.redirectTo);
  return (
    <form action={action} className="space-y-5">
      {state.error ? (
        <p role="alert" className="border-l-2 border-danger bg-surface px-3 py-2 text-sm text-ink">
          {state.error}
        </p>
      ) : null}
      <input type="hidden" name="next" value={next} />
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          defaultValue={state.email}
          className="h-11 w-full rounded-sm border border-rule-strong bg-paper px-3 focus:border-ink focus:outline-none"
        />
      </div>
      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-medium">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="h-11 w-full rounded-sm border border-rule-strong bg-paper px-3 focus:border-ink focus:outline-none"
        />
      </div>
      <Button type="submit" className="w-full" disabled={busy}>
        {busy ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
