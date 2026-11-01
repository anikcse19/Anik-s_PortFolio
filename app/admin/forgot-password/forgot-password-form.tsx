"use client";

import { useActionState } from "react";
import { requestPasswordResetAction, type ForgotPasswordState } from "@/app/admin/_actions/auth";
import { Button } from "@/components/ui/button";

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState<ForgotPasswordState, FormData>(requestPasswordResetAction, {});
  if (state.sent) {
    return (
      <p role="status" className="border-l-2 border-success bg-surface px-3 py-2 text-sm text-ink">
        If {state.email} belongs to an admin account, a reset link is on its way. It expires in 30 minutes. Check your spam folder if it
        does not arrive.
      </p>
    );
  }
  return (
    <form action={action} className="space-y-5">
      {state.error ? (
        <p role="alert" className="border-l-2 border-danger bg-surface px-3 py-2 text-sm text-ink">
          {state.error}
        </p>
      ) : null}
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
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Sending…" : "Send reset link"}
      </Button>
    </form>
  );
}
