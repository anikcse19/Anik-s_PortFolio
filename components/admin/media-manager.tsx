"use client";

import { Copy } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteDocumentAction, saveDocumentAction } from "@/app/admin/_actions/content";
import { Button } from "@/components/ui/button";
import type { Media } from "@/lib/types";
import type { ImageRef } from "@/lib/validation/common";
import { ConfirmButton } from "./confirm-dialog";
import { resultToStatus, StatusMessage, type SaveStatus } from "./editor-shell";
import { Field, FormSection, Input, TagInput } from "./fields";
import { ImageUrlField } from "./image-url-field";

type Draft = { image: ImageRef | null; label: string; tags: string[] };

export function MediaManager({ items }: { items: Media[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<string | null>(null);

  return (
    <div className="space-y-8">
      <MediaForm key="new" title="Add an image URL" initial={{ image: null, label: "", tags: [] }} onSaved={() => router.refresh()} />
      {items.length ? (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item) =>
            editing === item.id ? (
              <li key={item.id} className="sm:col-span-2 xl:col-span-3">
                <MediaForm
                  id={item.id}
                  title="Edit image"
                  initial={{ image: { url: item.url, alt: item.alt, caption: item.caption }, label: item.label, tags: item.tags }}
                  onSaved={() => {
                    setEditing(null);
                    router.refresh();
                  }}
                  onCancel={() => setEditing(null)}
                />
              </li>
            ) : (
              <li key={item.id} className="border border-rule">
                <div className="relative aspect-[16/10] overflow-hidden bg-surface">
                  {/* eslint-disable-next-line @next/next/no-img-element -- admin thumbnail of an external URL */}
                  <img src={item.url} alt={item.alt} loading="lazy" referrerPolicy="no-referrer" className="absolute inset-0 h-full w-full object-cover" />
                </div>
                <div className="space-y-2 p-3 text-sm">
                  <p className="font-medium">{item.label || item.alt}</p>
                  <p className="break-all font-mono text-xs text-ink-3">{item.url}</p>
                  {item.tags.length ? <p className="text-xs text-ink-3">{item.tags.join(", ")}</p> : null}
                  <div className="flex flex-wrap gap-1 pt-1">
                    <Button variant="ghost" size="sm" onClick={() => void navigator.clipboard?.writeText(item.url)}>
                      <Copy className="h-3.5 w-3.5" aria-hidden /> Copy URL
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setEditing(item.id)}>
                      Edit
                    </Button>
                    <ConfirmButton
                      title="Remove this image from the library?"
                      description="Only the saved reference is removed. Pages that already use this URL keep working."
                      confirmLabel="Remove"
                      variant="ghost"
                      className="text-danger"
                      onConfirm={async () => {
                        await deleteDocumentAction("media", item.id);
                        router.refresh();
                      }}
                    >
                      Remove
                    </ConfirmButton>
                  </div>
                </div>
              </li>
            ),
          )}
        </ul>
      ) : (
        <p className="border border-dashed border-rule-strong px-6 py-10 text-center text-sm text-ink-3">No saved images yet.</p>
      )}
    </div>
  );
}

function MediaForm({ id, title, initial, onSaved, onCancel }: { id?: string; title: string; initial: Draft; onSaved: () => void; onCancel?: () => void }) {
  const [draft, setDraft] = useState<Draft>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<SaveStatus>({ kind: "idle" });

  async function submit() {
    setStatus({ kind: "saving" });
    const payload = { url: draft.image?.url ?? "", alt: draft.image?.alt ?? "", caption: draft.image?.caption ?? "", label: draft.label, tags: draft.tags };
    const res = await saveDocumentAction("media", id ?? null, payload);
    setStatus(resultToStatus(res, id ? "Saved" : "Added to the library"));
    if (res.ok) {
      setErrors({});
      if (!id) setDraft({ image: null, label: "", tags: [] });
      onSaved();
    } else {
      setErrors(res.fieldErrors ?? {});
    }
  }

  return (
    <FormSection title={title} description="Saved URLs can be picked from any image field via “Library”. Nothing is uploaded.">
      <ImageUrlField label="Image" value={draft.image} required onChange={(image) => setDraft({ ...draft, image })} errors={{ url: errors.url, alt: errors.alt, caption: errors.caption }} />
      <Field label="Label" optional hint="Helps you find it later, e.g. “RexVet dashboard”.">
        {({ id: fid }) => <Input id={fid} value={draft.label} onChange={(e) => setDraft({ ...draft, label: e.target.value })} />}
      </Field>
      <TagInput label="Tags" value={draft.tags} onChange={(tags) => setDraft({ ...draft, tags })} max={10} />
      <div className="flex items-center gap-3">
        <Button size="sm" onClick={() => void submit()} disabled={status.kind === "saving"}>
          {id ? "Save" : "Add to library"}
        </Button>
        {onCancel ? (
          <Button size="sm" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
        <StatusMessage status={status} />
      </div>
    </FormSection>
  );
}
