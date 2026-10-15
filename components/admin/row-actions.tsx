"use client";

import { ArrowDown, ArrowUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteDocumentAction, moveDocumentAction, setStatusAction } from "@/app/admin/_actions/content";
import type { CollectionKey } from "@/lib/admin/collections";
import type { ActionResult } from "@/lib/types";
import { ConfirmButton } from "./confirm-dialog";
import { IconButton } from "./fields";

export function RowActions({
  collection,
  id,
  status,
  canMove,
  label,
}: {
  collection: CollectionKey;
  id: string;
  status?: "draft" | "published";
  canMove?: boolean;
  label: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const run = (fn: () => Promise<ActionResult>) =>
    startTransition(async () => {
      setError(null);
      const res = await fn();
      if (!res.ok) setError(res.error);
      router.refresh();
    });

  return (
    <div className="flex items-center justify-end gap-1">
      {error ? (
        <span role="alert" className="mr-2 max-w-[14rem] text-xs text-danger">
          {error}
        </span>
      ) : null}
      {canMove ? (
        <>
          <IconButton label={`Move ${label} up`} disabled={pending} onClick={() => run(() => moveDocumentAction(collection, id, "up"))}>
            <ArrowUp className="h-3.5 w-3.5" aria-hidden />
          </IconButton>
          <IconButton label={`Move ${label} down`} disabled={pending} onClick={() => run(() => moveDocumentAction(collection, id, "down"))}>
            <ArrowDown className="h-3.5 w-3.5" aria-hidden />
          </IconButton>
        </>
      ) : null}
      {status ? (
        <button
          type="button"
          disabled={pending}
          onClick={() => run(() => setStatusAction(collection, id, status === "published" ? "draft" : "published"))}
          className="h-8 rounded-sm px-2 text-xs text-ink-2 hover:bg-surface hover:text-ink disabled:opacity-50"
        >
          {status === "published" ? "Unpublish" : "Publish"}
          <span className="sr-only"> {label}</span>
        </button>
      ) : null}
      <ConfirmButton
        title={`Delete “${label}”?`}
        description="This permanently removes it. This cannot be undone."
        onConfirm={() => run(() => deleteDocumentAction(collection, id))}
        variant="ghost"
        className="h-8 px-2 text-xs text-danger"
        disabled={pending}
      >
        Delete<span className="sr-only"> {label}</span>
      </ConfirmButton>
    </div>
  );
}
