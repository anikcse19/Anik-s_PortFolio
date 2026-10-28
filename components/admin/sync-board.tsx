"use client";

import { Check, Copy, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { forgetSyncedAction, markSyncedAction, previewGithubAction, pushGithubAction } from "@/app/admin/_actions/sync";
import { ConfirmButton } from "@/components/admin/confirm-dialog";
import { Notice } from "@/components/admin/fields";
import { Button } from "@/components/ui/button";
import type { GithubPreview } from "@/lib/admin/github";
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

const DIFF_STYLES = {
  same: { sign: " ", className: "text-ink-3" },
  add: { sign: "+", className: "bg-success/10 text-success" },
  remove: { sign: "-", className: "bg-danger/10 text-danger" },
} as const;

function GithubReview({ preview }: { preview: GithubPreview }) {
  if (preview.upToDate) return <Notice tone="success">GitHub (@{preview.login}) already matches your site.</Notice>;
  if (preview.profile) {
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-xs text-ink-3">
            <tr>
              <th className="py-1 pr-3 font-medium">Field</th>
              <th className="py-1 pr-3 font-medium">On GitHub (@{preview.login})</th>
              <th className="py-1 font-medium">From your site</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-rule">
            {preview.profile.map((c) => (
              <tr key={c.field} className={c.changed ? "" : "text-ink-3"}>
                <td className="py-2 pr-3 align-top text-xs font-medium">{c.label}</td>
                <td className={cn("py-2 pr-3 align-top", c.changed && c.current && "text-danger line-through")}>{c.current || <em className="text-ink-3">empty</em>}</td>
                <td className={cn("py-2 align-top", c.changed && "text-success")}>{c.changed ? c.next : "unchanged"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-2 text-xs text-ink-3">Fields that are empty on your site aren&apos;t sent, so they stay as they are on GitHub.</p>
      </div>
    );
  }
  const readme = preview.readme!;
  if (!readme.repoExists) {
    return (
      <Notice tone="warning">
        The repository <code>{readme.repo}</code> doesn&apos;t exist, or the token can&apos;t see it. Create it as a public repository on GitHub (that&apos;s what shows a README on your profile) and make sure the token has access to it.
      </Notice>
    );
  }
  return (
    <div>
      <p className="mb-1 text-xs text-ink-2">
        {readme.fileExists ? `Changes to ${readme.repo}/${readme.path}` : `${readme.repo}/README.md will be created`}
      </p>
      <pre className="max-h-96 overflow-auto rounded-sm border border-rule bg-surface py-2 font-mono text-[0.75rem] leading-relaxed">
        {readme.diff.map((line, n) => (
          <div key={n} className={cn("whitespace-pre-wrap px-3", DIFF_STYLES[line.kind].className)}>
            {DIFF_STYLES[line.kind].sign} {line.text}
          </div>
        ))}
      </pre>
    </div>
  );
}

/** Review-then-push for a GitHub item. Keyed by the item's fingerprint, so a content change discards a stale review. */
function GithubPush({ item, disabled, run }: { item: SyncBoardItem; disabled: boolean; run: (fn: () => Promise<Parameters<typeof resultToStatus>[0]>) => void }) {
  const [preview, setPreview] = useState<GithubPreview | null>(null);
  const [status, setStatus] = useState<SaveStatus>({ kind: "idle" });
  const [loading, startLoading] = useTransition();
  const target = item.key === "github:readme" ? "your profile README" : "your GitHub profile";

  function review() {
    setStatus({ kind: "saving" });
    startLoading(async () => {
      const res = await previewGithubAction(item.key);
      if (res.ok && res.data) {
        setPreview(res.data);
        setStatus({ kind: "idle" });
      } else {
        setPreview(null);
        setStatus(resultToStatus(res));
      }
    });
  }

  return (
    <div className="space-y-3 border-t border-rule pt-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" variant="secondary" disabled={disabled || loading} onClick={review}>
          {loading ? "Checking GitHub…" : preview ? "Review again" : "Review changes on GitHub"}
        </Button>
        {preview && !preview.upToDate && preview.readme?.repoExists !== false ? (
          <ConfirmButton
            title={`Push to ${target}?`}
            description={`This updates ${target} on GitHub (@${preview.login}) with the text shown, then marks it as synced.`}
            confirmLabel="Push to GitHub"
            size="sm"
            disabled={disabled || loading}
            onConfirm={async () =>
              run(async () => {
                const res = await pushGithubAction(item.key, preview.hash);
                return res.ok && res.data && !res.data.changed ? { ...res, message: "GitHub already matched. Marked as synced." } : res;
              })
            }
          >
            Push to GitHub
          </ConfirmButton>
        ) : null}
      </div>
      <StatusMessage status={status} />

      {preview ? <GithubReview preview={preview} /> : null}
    </div>
  );
}

export function SyncBoard({ items, removed, githubUser, githubConnected }: { items: SyncBoardItem[]; removed: SyncRecord[]; githubUser: string; githubConnected: boolean }) {
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
                <p className="mt-1 text-xs text-ink-3">{c === "github" && githubConnected ? "Review and push, or copy and paste." : "Copy and paste, then mark as synced."}</p>
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

      {channel === "github" ? (
        <Notice>
          {githubConnected ? "GitHub is connected: review an item, then push it. " : "To push to GitHub from here, set GITHUB_TOKEN (see .env.example for the permissions it needs). Until then, copy and paste. "}
          Pinned repositories can&apos;t be set through GitHub&apos;s API; pin them{" "}
          {githubUser ? (
            <a href={`https://github.com/${githubUser}`} target="_blank" rel="noopener noreferrer" className="underline hover:text-ink">
              on your profile
            </a>
          ) : (
            "on your profile"
          )}
          .
        </Notice>
      ) : null}

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
                    {githubConnected && i.channel === "github" ? <GithubPush key={i.hash} item={i} disabled={pending} run={run} /> : null}
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
