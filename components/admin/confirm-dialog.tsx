"use client";

import { useRef, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

/**
 * Button that asks for confirmation in an accessible modal <dialog>
 * (focus is trapped by the browser and Escape cancels).
 */
export function ConfirmButton({
  children,
  title,
  description,
  confirmLabel = "Delete",
  onConfirm,
  variant = "danger",
  size = "sm",
  disabled,
  className,
}: {
  children: ReactNode;
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  onConfirm: () => Promise<void> | void;
  variant?: "danger" | "secondary" | "ghost" | "primary";
  size?: "sm" | "md";
  disabled?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [busy, setBusy] = useState(false);

  return (
    <>
      <Button variant={variant} size={size} disabled={disabled} className={className} onClick={() => ref.current?.showModal()}>
        {children}
      </Button>
      <dialog ref={ref} className="w-[min(28rem,calc(100vw-2rem))] border border-rule-strong bg-paper p-0 text-ink backdrop:bg-ink/40" aria-labelledby="confirm-title">
        <div className="p-6">
          <h2 id="confirm-title" className="text-lg font-semibold">
            {title}
          </h2>
          {description ? <div className="mt-2 text-sm text-ink-2">{description}</div> : null}
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="secondary" size="sm" onClick={() => ref.current?.close()} autoFocus>
              Cancel
            </Button>
            <Button
              variant={variant === "danger" ? "danger" : "primary"}
              size="sm"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                try {
                  await onConfirm();
                } finally {
                  setBusy(false);
                  ref.current?.close();
                }
              }}
            >
              {busy ? "Working…" : confirmLabel}
            </Button>
          </div>
        </div>
      </dialog>
    </>
  );
}
