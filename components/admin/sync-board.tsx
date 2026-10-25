"use client";

import { Check, Copy, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { forgetSyncedAction, markSyncedAction } from "@/app/admin/_actions/sync";
import { ConfirmButton } from "@/components/admin/confirm-dialog";
import { Notice } from "@/components/admin/fields";
import { Button } from "@/components/ui/button";
import type { SyncBoardItem } from "@/lib/admin/sync";
import { SYNC_CHANNEL_LABELS, type SyncChannel, type SyncField, type SyncRecord } from "@/lib/profile-sync";
import { RESUME_PATH } from "@/lib/resume";
import { cn } from "@/lib/utils";
import { resultToStatus, StatusMessage, type SaveStatus } from "./editor-shell";

const CHANNELS: SyncChannel[] = ["linkedin", "github"];

const STATUS_STYLES: Record<SyncBoardItem["status"], { label: string; className: string }> = {
  new: { label: "Not synced yet", className: "bg-surface-2 text-ink-2" },
  changed: { label: "Changed since last sync", className: "bg-warning/15 text-warning" },
  synced: { label: "In sync", className: "bg-success/10 text-success" },
};

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="inline-flex h-7 items-center gap-1 rounded-sm border border-rule px-2 text-xs text-ink-2 hover:border-ink hover:text-ink"
    >
      {copied ? <Check aria-hidden className="h-3.5 w-3.5 text-success" /> : <Copy aria-hidden className="h-3.5 w-3.5" />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

function FieldRow({ field }: { field: SyncField }) {
  const over = field.limit !== undefined && field.value.length > field.limit;
  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-3">
        <p className="text-xs font-medium text-ink-2">{field.label}</p>
        <div className="flex items-center gap-2">
          {field.limit ? (
            <span className={cn("font-mono text-[0.6875rem]", over ? "text-danger" : "text-ink-3")}>
              {field.value.length}/{field.limit}
            </span>
          ) : null}
          <CopyButton value={field.value} />
        </div>
      </div>
      {field.multiline ? (
        <textarea
          readOnly
          value={field.value}
          rows={Math.min(14, Math.max(3, field.value.split("\n").length + 1))}
          aria-label={field.label}
          className="w-full resize-y rounded-sm border border-rule bg-surface px-3 py-2 font-mono text-[0.8125rem] leading-relaxed text-ink"
        />
      ) : (
        <p className="rounded-sm border border-rule bg-surface px-3 py-2 text-[0.875rem] text-ink">{field.value}</p>
      )}
    </div>
  );
}

export function SyncBoard({ items, removed }: { items: SyncBoardItem[]; removed: SyncRecord[] }) {
  const router = useRouter();
  const [channel, setChannel] = useState<SyncChannel>("linkedin");
  const [showAll, setShowAll] = useState(false);
  const [status, setStatus] = useState<SaveStatus>({ kind: "idle" });
  const [pending, start] = useTransition();

  const outdated = (c: SyncChannel) => items.filter((i) => i.channel === c && i.status !== "synced").length;
  const removedFor = (c: SyncChannel) => removed.filter((r) => r.key.startsWith(`${c}:`));
  const channelItems = items.filter((i) => i.channel === channel);
  const visible = showAll ? channelItems : channelItems.filter((i) => i.status !== "synced");
  const groups = Array.from(new Set(visible.map((i) => i.group)));

  function run(fn: () => Promise<Parameters<typeof resultToStatus>[0]>) {
    setStatus({ kind: "saving" });
    start(async () => {
      const res = await fn();
      setStatus(resultToStatus(res));
      if (res.ok) router.refresh();
    });
  }
  const mark = (list: SyncBoardItem[]) => run(() => markSyncedAction(list.map((i) => ({ key: i.key, hash: i.hash, title: i.title }))));

  return (
    <div className="mt-6 space-y-6">
      <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <li className="border border-rule p-4">
          <p className="label">Portfolio</p>
          <p className="mt-2 text-sm text-success">Automatic</p>
          <p className="mt-1 text-xs text-ink-3">Published changes go live immediately.</p>
        </li>
        <li className="border border-rule p-4">
          <p className="label">Résumé</p>
          <p className="mt-2 text-sm text-success">Automatic</p>
          <a href={RESUME_PATH} target="_blank" rel="noopener" className="mt-1 inline-flex items-center gap-1 text-xs text-ink-3 underline hover:text-ink">
            Generated PDF <ExternalLink aria-hidden className="h-3 w-3" />
          </a>
        </li>
        {CHANNELS.map((c) => {
          const n = outdated(c) + removedFor(c).length;
          return (
            <li key={c}>
              <button
                type="button"
                onClick={() => setChannel(c)}
                aria-pressed={channel === c}
                className={cn("block h-full w-full border p-4 text-left hover:border-ink", channel === c ? "border-ink bg-surface" : "border-rule")}
              >
                <p className="label">{SYNC_CHANNEL_LABELS[c]}</p>
                <p className={cn("mt-2 text-sm", n ? "text-warning" : "text-success")}>{n ? `${n} to update` : "In sync"}</p>
                <p className="mt-1 text-xs text-ink-3">Copy and paste, then mark as synced.</p>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-rule pb-3">
        <div className="flex gap-1 text-sm" role="group" aria-label="Filter">
          <Button size="sm" variant={showAll ? "ghost" : "secondary"} onClick={() => setShowAll(false)}>
            Needs update ({outdated(channel)})
          </Button>
          <Button size="sm" variant={showAll ? "secondary" : "ghost"} onClick={() => setShowAll(true)}>
            All ({channelItems.length})
          </Button>
        </div>
        {outdated(channel) ? (
          <ConfirmButton
            title={`Mark all ${SYNC_CHANNEL_LABELS[channel]} items as synced?`}
            description={`Use this once your ${SYNC_CHANNEL_LABELS[channel]} profile already matches the site. Future edits will then show up here as changes.`}
            confirmLabel="Mark all as synced"
            variant="secondary"
            disabled={pending}
            onConfirm={async () => mark(channelItems.filter((i) => i.status !== "synced"))}
          >
            Mark all as synced
          </ConfirmButton>
        ) : null}
      </div>
      <StatusMessage status={status} />

      {removedFor(channel).length ? (
        <section aria-labelledby="removed-heading" className="border border-danger/40 p-4">
          <h2 id="removed-heading" className="text-sm font-semibold text-ink">
            Removed from your site: delete these on {SYNC_CHANNEL_LABELS[channel]} too
          </h2>
          <ul className="mt-3 divide-y divide-rule">
            {removedFor(channel).map((r) => (
              <li key={r.key} className="flex items-center justify-between gap-3 py-2 text-sm">
                <span>{r.title || r.key}</span>
                <Button size="sm" variant="secondary" disabled={pending} onClick={() => run(() => forgetSyncedAction([r.key]))}>
                  Done
                </Button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {!visible.length ? (
        <Notice tone="success">Everything on {SYNC_CHANNEL_LABELS[channel]} matches your site. Edits you publish will appear here.</Notice>
      ) : (
        groups.map((group) => (
          <section key={group} aria-labelledby={`group-${group}`} className="space-y-4">
            <h2 id={`group-${group}`} className="text-[0.9375rem] font-semibold">
              {group}
            </h2>
            {visible
              .filter((i) => i.group === group)
              .map((i) => (
                <article key={i.key} className="border border-rule">
                  <header className="flex flex-wrap items-start justify-between gap-3 border-b border-rule px-4 py-3">
                    <div className="min-w-0">
                      <h3 className="font-medium text-ink">{i.title}</h3>
                      {i.subtitle ? <p className="text-xs text-ink-3">{i.subtitle}</p> : null}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={cn("rounded-sm px-1.5 py-0.5 font-mono text-[0.6875rem] uppercase tracking-wide", STATUS_STYLES[i.status].className)}>{STATUS_STYLES[i.status].label}</span>
                      {i.editUrl ? (
                        <a href={i.editUrl} target="_blank" rel="noopener noreferrer" className="inline-flex h-8 items-center gap-1 rounded-sm px-2 text-sm text-ink-2 hover:bg-surface hover:text-ink">
                          Open {SYNC_CHANNEL_LABELS[i.channel]} <ExternalLink aria-hidden className="h-3.5 w-3.5" />
                        </a>
                      ) : null}
                      {i.status !== "synced" ? (
                        <Button size="sm" disabled={pending} onClick={() => mark([i])}>
                          Mark as synced
                        </Button>
                      ) : null}
                    </div>
                  </header>
                  <div className="space-y-4 p-4">
                    {i.fields.map((f) => (
                      <FieldRow key={f.label} field={f} />
                    ))}
                    {i.syncedAt ? <p className="text-xs text-ink-3">Last synced {new Date(i.syncedAt).toLocaleString()}</p> : null}
                  </div>
                </article>
              ))}
          </section>
        ))
      )}
    </div>
  );
}
