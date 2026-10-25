"use client";

import { useRouter } from "next/navigation";
import { Fragment, useTransition } from "react";
import { deleteMessageAction, setMessageReadAction } from "@/app/admin/_actions/messages";
import { Button } from "@/components/ui/button";
import type { ContactMessage } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ConfirmButton } from "./confirm-dialog";

const DELIVERY: Record<ContactMessage["delivery"], string> = {
  stored: "Saved (no email sent)",
  emailed: "Saved and emailed",
  email_failed: "Saved — email notification failed",
};

const DETAIL_FIELDS = [
  ["company", "Company"],
  ["service", "Service"],
  ["budget", "Budget"],
  ["timeline", "Timeline"],
] as const;

export function MessageList({ messages }: { messages: ContactMessage[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  if (!messages.length) return <p className="border border-dashed border-rule-strong px-6 py-10 text-center text-sm text-ink-3">No messages.</p>;

  return (
    <ul className="divide-y divide-rule border-y border-rule">
      {messages.map((m) => (
        <li key={m.id}>
          <details
            className="group"
            onToggle={(e) => {
              if ((e.currentTarget as HTMLDetailsElement).open && !m.read) start(async () => {
                await setMessageReadAction(m.id, true);
                router.refresh();
              });
            }}
          >
            <summary className="grid cursor-pointer list-none gap-1 px-3 py-3 hover:bg-surface md:grid-cols-[1fr_14rem_10rem]">
              <span className={cn("truncate", !m.read && "font-semibold")}>
                {!m.read ? <span className="mr-2 inline-block h-2 w-2 rounded-full bg-accent" aria-label="Unread" /> : null}
                {m.source === "studio" ? <span className="tag mr-2 align-middle">Studio</span> : null}
                {m.subject || m.message.slice(0, 80)}
              </span>
              <span className="truncate text-sm text-ink-2">{m.name}</span>
              <time className="text-sm text-ink-3" dateTime={m.createdAt}>
                {new Date(m.createdAt).toLocaleString()}
              </time>
            </summary>
            <div className="space-y-4 border-t border-rule bg-surface px-3 py-4">
              <dl className="grid gap-1 text-sm md:grid-cols-[6rem_1fr]">
                <dt className="text-ink-3">From</dt>
                <dd>
                  {m.name} &lt;
                  <a href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.subject || "your message"}`)}`} className="underline">
                    {m.email}
                  </a>
                  &gt;
                </dd>
                {DETAIL_FIELDS.map(([key, label]) =>
                  m.details?.[key] ? (
                    <Fragment key={key}>
                      <dt className="text-ink-3">{label}</dt>
                      <dd>{m.details[key]}</dd>
                    </Fragment>
                  ) : null,
                )}
                <dt className="text-ink-3">Delivery</dt>
                <dd>{DELIVERY[m.delivery]}</dd>
              </dl>
              {/* Rendered as text: visitor input is never interpreted as HTML. */}
              <p className="whitespace-pre-wrap text-[0.9375rem] text-ink">{m.message}</p>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={pending}
                  onClick={() =>
                    start(async () => {
                      await setMessageReadAction(m.id, !m.read);
                      router.refresh();
                    })
                  }
                >
                  Mark as {m.read ? "unread" : "read"}
                </Button>
                <ConfirmButton
                  title="Delete this message?"
                  onConfirm={async () => {
                    await deleteMessageAction(m.id);
                    router.refresh();
                  }}
                >
                  Delete
                </ConfirmButton>
              </div>
            </div>
          </details>
        </li>
      ))}
    </ul>
  );
}
