"use client";

import { Eye, EyeOff } from "lucide-react";
import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { unlockAction, type UnlockState } from "./actions";

const initialState: UnlockState = { error: null };

export function UnlockForm({ next, disabled }: { next: string; disabled: boolean }) {
  const [state, formAction, pending] = useActionState(unlockAction, initialState);
  const [visible, setVisible] = useState(false);

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <input type="hidden" name="next" value={next} />
      <div>
        <label htmlFor="password" className="mb-2 block text-sm font-medium text-ink">
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={visible ? "text" : "password"}
            autoComplete="current-password"
            autoFocus
            required
            disabled={disabled}
            aria-invalid={state.error ? true : undefined}
            aria-describedby={state.error ? "unlock-error" : undefined}
            className={cn(
              "h-12 w-full rounded-lg border bg-paper pl-4 pr-12 text-ink placeholder:text-ink-3 focus:outline-none disabled:opacity-50",
              state.error ? "border-danger focus:border-danger" : "border-rule-strong focus:border-ink",
            )}
          />
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            className="absolute right-1.5 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-ink-3 hover:bg-surface hover:text-ink"
            aria-label={visible ? "Hide password" : "Show password"}
          >
            {visible ? <EyeOff aria-hidden className="h-4 w-4" /> : <Eye aria-hidden className="h-4 w-4" />}
          </button>
        </div>
        {state.error ? (
          <p id="unlock-error" role="alert" className="mt-2 text-sm text-danger">
            {state.error}
          </p>
        ) : null}
      </div>
      <Button type="submit" className="h-12 w-full rounded-lg bg-ink text-paper hover:bg-ink/90" disabled={pending || disabled}>
        {pending ? "Checking…" : "Continue"}
      </Button>
    </form>
  );
}
