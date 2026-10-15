"use client";

import { ImageIcon, Library, Search, X } from "lucide-react";
import { useId, useRef, useState } from "react";
import { listMediaAction, type MediaPickerItem } from "@/app/admin/_actions/content";
import { checkImageUrl, IMAGE_HOSTING_HINT } from "@/lib/images";
import type { ImageRef } from "@/lib/validation/common";
import { cn } from "@/lib/utils";
import { controlClass, Input } from "./fields";

type LoadState = { status: "idle" | "loading" | "loaded" | "error"; width?: number; height?: number };

/**
 * The one image control used everywhere in the admin. Images are referenced by
 * URL only (no uploads): the field validates the URL, previews it at the aspect
 * ratio it will be displayed at, reports load failures, and collects alt text.
 */
export function ImageUrlField({
  label,
  value,
  onChange,
  aspect = "16 / 10",
  aspectLabel = "16:10",
  errors = {},
  withCaption = true,
  required = false,
}: {
  label: string;
  value: ImageRef | null;
  onChange: (value: ImageRef | null) => void;
  aspect?: string;
  aspectLabel?: string;
  errors?: { url?: string; alt?: string; caption?: string; self?: string };
  withCaption?: boolean;
  required?: boolean;
}) {
  const id = useId();
  const url = value?.url ?? "";
  const check = checkImageUrl(url);
  const [fit, setFit] = useState<"cover" | "contain">("cover");
  const previewUrl = check.ok && check.kind !== "empty" ? check.url : "";
  // The load result is remembered per URL, so a new URL is "loading" until its image reports back.
  const [loadResult, setLoadResult] = useState<(LoadState & { url: string }) | null>(null);
  const load: LoadState = !previewUrl ? { status: "idle" } : loadResult?.url === previewUrl ? loadResult : { status: "loading" };

  const urlError = errors.url ?? errors.self ?? (!check.ok ? check.error : undefined);
  const update = (patch: Partial<ImageRef>) => {
    const next = { url, alt: value?.alt ?? "", caption: value?.caption ?? "", ...patch };
    onChange(next.url.trim() === "" && !next.alt && !next.caption ? null : next);
  };

  const ratioNote =
    load.status === "loaded" && load.width && load.height
      ? (() => {
          const [aw, ah] = aspect.split("/").map((n) => Number(n.trim()));
          const actual = load.width / load.height;
          const target = aw / ah;
          const off = Math.abs(actual - target) / target;
          return off > 0.08 ? `Source is ${load.width}×${load.height}; it will be cropped to ${aspectLabel}.` : `Source is ${load.width}×${load.height}.`;
        })()
      : null;

  return (
    <fieldset className="space-y-3">
      <legend className="mb-1.5 flex w-full items-baseline justify-between text-sm font-medium text-ink">
        <span>{label}</span>
        {!required ? <span className="text-xs font-normal text-ink-3">Optional</span> : null}
      </legend>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,16rem)]">
        <div className="space-y-3">
          <div>
            <label htmlFor={`${id}-url`} className="sr-only">
              Image URL
            </label>
            <div className="flex gap-2">
              <Input
                id={`${id}-url`}
                type="url"
                inputMode="url"
                placeholder="https://…/image.jpg or /projects/cover.png"
                value={url}
                invalid={Boolean(urlError)}
                aria-describedby={`${id}-help`}
                onChange={(e) => update({ url: e.target.value })}
                className="font-mono text-sm"
              />
              <MediaPicker onPick={(item) => onChange({ url: item.url, alt: item.alt, caption: withCaption ? item.caption : "" })} />
              {value ? (
                <button type="button" onClick={() => onChange(null)} className="inline-flex h-10 shrink-0 items-center rounded-sm border border-rule-strong px-2.5 text-ink-3 hover:text-danger" aria-label={`Clear ${label}`} title="Clear image">
                  <X className="h-4 w-4" aria-hidden />
                </button>
              ) : null}
            </div>
            <p id={`${id}-help`} className="mt-1.5 text-xs text-ink-3">
              {IMAGE_HOSTING_HINT}
            </p>
            {urlError ? (
              <p className="mt-1.5 text-sm text-danger" role="alert">
                {urlError}
              </p>
            ) : check.ok && check.kind === "remote" && check.warning ? (
              <p className="mt-1.5 text-sm text-warning">{check.warning}</p>
            ) : null}
          </div>

          {value ? (
            <>
              <div>
                <label htmlFor={`${id}-alt`} className="mb-1.5 block text-sm font-medium text-ink">
                  Alt text
                </label>
                <Input id={`${id}-alt`} value={value.alt} maxLength={300} invalid={Boolean(errors.alt)} onChange={(e) => update({ alt: e.target.value })} placeholder="Describe what the image shows" aria-describedby={`${id}-alt-hint`} />
                <p id={`${id}-alt-hint`} className="mt-1 text-xs text-ink-3">
                  Read by screen readers and shown if the image fails. Describe the content, not “screenshot of…”.
                </p>
                {errors.alt ? <p className="mt-1 text-sm text-danger">{errors.alt}</p> : null}
              </div>
              {withCaption ? (
                <div>
                  <label htmlFor={`${id}-caption`} className="mb-1.5 flex justify-between text-sm font-medium text-ink">
                    Caption <span className="text-xs font-normal text-ink-3">Optional</span>
                  </label>
                  <Input id={`${id}-caption`} value={value.caption} maxLength={300} onChange={(e) => update({ caption: e.target.value })} />
                  {errors.caption ? <p className="mt-1 text-sm text-danger">{errors.caption}</p> : null}
                </div>
              ) : null}
            </>
          ) : null}
        </div>

        <div>
          <div className="relative overflow-hidden border border-rule bg-surface" style={{ aspectRatio: aspect }}>
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- admin preview of an arbitrary external URL
              <img
                key={previewUrl}
                src={previewUrl}
                alt=""
                referrerPolicy="no-referrer"
                className={cn("absolute inset-0 h-full w-full", fit === "cover" ? "object-cover" : "object-contain", load.status === "error" && "hidden")}
                onLoad={(e) => setLoadResult({ url: previewUrl, status: "loaded", width: e.currentTarget.naturalWidth, height: e.currentTarget.naturalHeight })}
                onError={() => setLoadResult({ url: previewUrl, status: "error" })}
              />
            ) : null}
            {!previewUrl || load.status === "error" ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-3 text-center text-xs text-ink-3">
                <ImageIcon className="h-5 w-5" aria-hidden />
                {load.status === "error" ? "Could not load this image. The URL may be wrong, private, or the host may block embedding." : "No image"}
              </div>
            ) : null}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-ink-3">
            <span aria-live="polite">
              {load.status === "loading" ? "Loading preview…" : load.status === "loaded" ? (ratioNote ?? "Loaded") : load.status === "error" ? "Failed to load" : `Displayed at ${aspectLabel}`}
            </span>
            {previewUrl && load.status === "loaded" ? (
              <button type="button" className="underline" onClick={() => setFit(fit === "cover" ? "contain" : "cover")}>
                {fit === "cover" ? "Show full image" : "Show crop"}
              </button>
            ) : null}
          </div>
        </div>
      </div>

    </fieldset>
  );
}

/** "Library" button plus a modal listing saved image URLs; items load when it opens. */
function MediaPicker({ onPick }: { onPick: (item: MediaPickerItem) => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [items, setItems] = useState<MediaPickerItem[] | null>(null);
  const [q, setQ] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function load(query: string) {
    setError(null);
    const res = await listMediaAction(query);
    if (res.ok) setItems(res.data ?? []);
    else setError(res.error);
  }

  function open() {
    dialogRef.current?.showModal();
    void load("");
  }

  return (
    <>
      <button type="button" onClick={open} className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-sm border border-rule-strong px-3 text-sm text-ink-2 hover:text-ink">
        <Library className="h-4 w-4" aria-hidden />
        Library
      </button>
    <dialog
      ref={dialogRef}
      className="w-[min(48rem,calc(100vw-2rem))] border border-rule-strong bg-paper p-0 text-ink backdrop:bg-ink/40"
      aria-label="Image library"
      onClose={() => setQ("")}
    >
      <div className="flex items-center justify-between border-b border-rule px-5 py-3">
        <h2 className="font-semibold">Image library</h2>
        <button type="button" onClick={() => dialogRef.current?.close()} className="rounded-sm p-1 text-ink-3 hover:text-ink" aria-label="Close">
          <X className="h-4 w-4" aria-hidden />
        </button>
      </div>
      <div className="p-5">
        <form
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            void load(q);
          }}
          className="relative"
        >
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" aria-hidden />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search saved images" aria-label="Search saved images" className={cn(controlClass(), "h-10 pl-9")} />
        </form>
        {error ? <p className="mt-4 text-sm text-danger">{error}</p> : null}
        {items === null ? (
          <p className="mt-6 text-sm text-ink-3">Loading…</p>
        ) : items.length === 0 ? (
          <p className="mt-6 text-sm text-ink-3">No saved images yet. Add frequently used image URLs under Admin › Images.</p>
        ) : (
          <ul className="mt-4 grid max-h-[60vh] grid-cols-2 gap-3 overflow-y-auto sm:grid-cols-3">
            {items.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => {
                    onPick(item);
                    dialogRef.current?.close();
                  }} className="group block w-full border border-rule text-left hover:border-ink">
                  <span className="relative block aspect-[4/3] overflow-hidden bg-surface">
                    {/* eslint-disable-next-line @next/next/no-img-element -- admin thumbnail of an external URL */}
                    <img src={item.url} alt="" loading="lazy" referrerPolicy="no-referrer" className="absolute inset-0 h-full w-full object-cover" />
                  </span>
                  <span className="block truncate px-2 py-1.5 text-xs text-ink-2">{item.label || item.alt}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </dialog>
    </>
  );
}

/** Ordered list of images (project gallery). */
export function GalleryField({
  value,
  onChange,
  errorAt,
}: {
  value: ImageRef[];
  onChange: (v: ImageRef[]) => void;
  errorAt: (index: number, field: "url" | "alt" | "caption") => string | undefined;
}) {
  return (
    <div className="space-y-6">
      {value.map((img, i) => (
        <div key={i} className="border-t border-rule pt-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="label">Image {i + 1}</p>
            <div className="flex gap-1">
              <button type="button" className="rounded-sm px-2 py-1 text-xs text-ink-3 hover:text-ink disabled:opacity-30" disabled={i === 0} onClick={() => onChange(swap(value, i, i - 1))}>
                Move up
              </button>
              <button type="button" className="rounded-sm px-2 py-1 text-xs text-ink-3 hover:text-ink disabled:opacity-30" disabled={i === value.length - 1} onClick={() => onChange(swap(value, i, i + 1))}>
                Move down
              </button>
            </div>
          </div>
          <ImageUrlField
            label={`Gallery image ${i + 1}`}
            value={img}
            required
            onChange={(next) => onChange(next ? value.map((v, j) => (j === i ? next : v)) : value.filter((_, j) => j !== i))}
            errors={{ url: errorAt(i, "url"), alt: errorAt(i, "alt"), caption: errorAt(i, "caption") }}
          />
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...value, { url: "", alt: "", caption: "" }])}
        disabled={value.length >= 16}
        className="inline-flex items-center gap-1.5 rounded-sm border border-dashed border-rule-strong px-3 py-1.5 text-sm text-ink-2 hover:border-ink hover:text-ink disabled:opacity-40"
      >
        + Add gallery image
      </button>
    </div>
  );
}

function swap<T>(list: T[], a: number, b: number): T[] {
  const copy = [...list];
  [copy[a], copy[b]] = [copy[b], copy[a]];
  return copy;
}
