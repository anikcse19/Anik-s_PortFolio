"use client";

import { useState } from "react";
import { checkLinksAction } from "@/app/admin/_actions/account";
import { Button } from "@/components/ui/button";
import type { LinkCheckResult } from "@/lib/admin/link-check";

export function LinkChecker() {
  const [results, setResults] = useState<LinkCheckResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const broken = results?.filter((r) => !r.ok) ?? [];

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <Button
          size="sm"
          variant="secondary"
          disabled={running}
          onClick={async () => {
            setRunning(true);
            setError(null);
            const res = await checkLinksAction();
            setRunning(false);
            if (res.ok) setResults(res.data ?? []);
            else setError(res.error);
          }}
        >
          {running ? "Checking…" : "Check published links & images"}
        </Button>
        <span aria-live="polite" className="text-sm text-ink-3">
          {results ? `${results.length} checked · ${broken.length} problem${broken.length === 1 ? "" : "s"}` : "Checks up to 40 external URLs on demand."}
        </span>
      </div>
      {error ? <p className="mt-2 text-sm text-danger">{error}</p> : null}
      {results && results.length ? (
        <ul className="mt-4 divide-y divide-rule border-y border-rule text-sm">
          {[...broken, ...results.filter((r) => r.ok)].map((r) => (
            <li key={r.url} className="grid gap-1 py-2 md:grid-cols-[8rem_1fr]">
              <span className={r.ok ? "text-success" : "text-danger"}>{r.ok ? `OK ${r.status}` : r.status}</span>
              <span>
                <span className="text-ink">{r.where}</span>
                <span className="block break-all font-mono text-xs text-ink-3">{r.url}</span>
              </span>
            </li>
          ))}
        </ul>
      ) : null}
      <p className="mt-2 text-xs text-ink-3">Some sites block automated requests and may show as errors even though they work in a browser.</p>
    </div>
  );
}
