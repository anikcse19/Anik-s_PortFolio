"use client";

import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { deleteDocumentAction, saveDocumentAction } from "@/app/admin/_actions/content";
import { Button } from "@/components/ui/button";
import type { CollectionKey } from "@/lib/admin/collections";
import type { ActionResult } from "@/lib/types";
import { ConfirmButton } from "./confirm-dialog";
import { StatusBadge } from "./fields";
import { useForm } from "./use-form";

export type SaveStatus =
  | { kind: "idle" }
  | { kind: "saving" }
  | { kind: "success"; message: string }
  | { kind: "error"; message: string; unauthorized?: boolean };

/** Shows the result of the last save in a polite live region. */
export function StatusMessage({ status }: { status: SaveStatus }) {
  return (
    <div aria-live="polite" className="min-h-[1.25rem] text-sm">
      {status.kind === "saving" ? <span className="text-ink-3">Saving…</span> : null}
      {status.kind === "success" ? <span className="text-success">{status.message}</span> : null}
      {status.kind === "error" ? (
        <span className="text-danger" role="alert">
          {status.message}{" "}
          {status.unauthorized ? (
            <Link href="/admin/login" target="_blank" className="underline">
              Sign in again (opens a new tab, your edits stay here)
            </Link>
          ) : null}
        </span>
      ) : null}
    </div>
  );
}

export function resultToStatus(res: ActionResult<unknown>, fallback = "Saved"): SaveStatus {
  if (res.ok) return { kind: "success", message: res.message ?? fallback };
  return { kind: "error", message: res.error, unauthorized: res.code === "UNAUTHORIZED" };
}

const ROUTES: Record<Exclude<CollectionKey, "media">, string> = {
  projects: "projects",
  caseStudies: "case-studies",
  articles: "articles",
  experience: "experience",
  skills: "skills",
};

/**
 * State and persistence for a document editor (projects, case studies, ...).
 * Handles create vs update, optimistic-concurrency tokens, publish/unpublish
 * and navigation to the new URL after the first save.
 */
export function useDocumentEditor<T extends { status?: "draft" | "published" }>(opts: {
  collection: Exclude<CollectionKey, "media">;
  id: string | null;
  updatedAt: string | null;
  initial: T;
}) {
  const router = useRouter();
  const form = useForm<T>(opts.initial);
  const [id, setId] = useState(opts.id);
  const [updatedAt, setUpdatedAt] = useState(opts.updatedAt);
  const [status, setStatus] = useState<SaveStatus>({ kind: "idle" });

  async function save(overrides: Partial<T> = {}, successMessage?: string) {
    setStatus({ kind: "saving" });
    const data = { ...form.value, ...overrides };
    const res = await saveDocumentAction(opts.collection, id, data, updatedAt ?? undefined);
    if (res.ok && res.data) {
      form.reset(data);
      setUpdatedAt(res.data.updatedAt);
      setStatus({ kind: "success", message: successMessage ?? "Saved" });
      if (!id) {
        setId(res.data.id);
        router.replace(`/admin/${ROUTES[opts.collection]}/${res.data.id}`);
      }
      router.refresh();
      return true;
    }
    if (!res.ok) {
      form.setErrors(res.fieldErrors ?? {});
      setStatus({ kind: "error", message: res.error, unauthorized: res.code === "UNAUTHORIZED" });
    }
    return false;
  }

  async function remove() {
    if (!id) return;
    const res = await deleteDocumentAction(opts.collection, id);
    if (res.ok) {
      form.setDirty(false);
      router.push(`/admin/${ROUTES[opts.collection]}?deleted=1`);
      router.refresh();
    } else {
      setStatus(resultToStatus(res));
    }
  }

  return { form, id, status, save, remove, route: ROUTES[opts.collection] };
}

/** Sticky header for document editors with save / publish / delete actions. */
export function EditorHeader({
  title,
  backHref,
  backLabel,
  status,
  publication,
  dirty,
  saving,
  onSave,
  onPublish,
  onUnpublish,
  onDelete,
  previewHref,
  publicHref,
  deleteLabel = "this item",
  extra,
}: {
  title: string;
  backHref: string;
  backLabel: string;
  status: SaveStatus;
  publication?: "draft" | "published";
  dirty: boolean;
  saving: boolean;
  onSave: () => void;
  onPublish?: () => void;
  onUnpublish?: () => void;
  onDelete?: () => Promise<void>;
  previewHref?: string | null;
  publicHref?: string | null;
  deleteLabel?: string;
  extra?: ReactNode;
}) {
  return (
    <div className="sticky top-0 z-20 -mx-4 border-b border-rule bg-paper/95 px-4 py-3 backdrop-blur-sm md:-mx-8 md:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <Link href={backHref} className="text-xs text-ink-3 hover:text-ink">
            ← {backLabel}
          </Link>
          <div className="mt-0.5 flex items-center gap-2">
            <h1 className="truncate text-lg font-semibold">{title}</h1>
            {publication ? <StatusBadge status={publication} /> : null}
            {dirty ? <span className="text-xs text-warning">Unsaved changes</span> : null}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {extra}
          {previewHref ? (
            <a href={previewHref} target="_blank" rel="noopener" className="inline-flex h-8 items-center gap-1 rounded-sm px-2 text-sm text-ink-2 hover:bg-surface hover:text-ink">
              Preview <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            </a>
          ) : null}
          {publicHref ? (
            <a href={publicHref} target="_blank" rel="noopener" className="inline-flex h-8 items-center gap-1 rounded-sm px-2 text-sm text-ink-2 hover:bg-surface hover:text-ink">
              View live <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            </a>
          ) : null}
          {onDelete ? (
            <ConfirmButton title={`Delete ${deleteLabel}?`} description="This permanently removes it from the database and the public site. This cannot be undone." onConfirm={onDelete} variant="ghost" className="text-danger">
              Delete
            </ConfirmButton>
          ) : null}
          {publication === "published" && onUnpublish ? (
            <Button variant="secondary" size="sm" disabled={saving} onClick={onUnpublish}>
              Unpublish
            </Button>
          ) : null}
          <Button variant={publication === "draft" && onPublish ? "secondary" : "primary"} size="sm" disabled={saving} onClick={onSave}>
            {publication === "draft" ? "Save draft" : "Save"}
          </Button>
          {publication === "draft" && onPublish ? (
            <Button size="sm" disabled={saving} onClick={onPublish}>
              Publish
            </Button>
          ) : null}
        </div>
      </div>
      <StatusMessage status={status} />
    </div>
  );
}
