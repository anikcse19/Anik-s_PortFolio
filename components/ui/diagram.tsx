"use client";

import { useTheme } from "next-themes";
import { useEffect, useId, useState } from "react";

type DiagramProps = {
  source: string;
  title?: string;
  description: string;
};

/**
 * Renders a Mermaid diagram on the client. Mermaid is imported lazily, so pages
 * without diagrams never download it. `securityLevel: "strict"` sanitizes labels
 * and disables click handlers. The text description is always present for
 * screen readers, and the source stays available if rendering fails.
 */
export function Diagram({ source, title, description }: DiagramProps) {
  const reactId = useId();
  const { resolvedTheme } = useTheme();
  const [svg, setSvg] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { default: mermaid } = await import("mermaid");
        const styles = getComputedStyle(document.documentElement);
        const rgb = (name: string) => `rgb(${styles.getPropertyValue(name).trim().split(/\s+/).join(",")})`;
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "strict",
          theme: "base",
          fontFamily: styles.getPropertyValue("--font-body") ? "var(--font-body), system-ui, sans-serif" : "system-ui, sans-serif",
          themeVariables: {
            background: rgb("--paper"),
            primaryColor: rgb("--surface"),
            primaryTextColor: rgb("--ink"),
            primaryBorderColor: rgb("--rule-strong"),
            secondaryColor: rgb("--surface-2"),
            tertiaryColor: rgb("--paper"),
            lineColor: rgb("--ink-3"),
            textColor: rgb("--ink"),
            noteBkgColor: rgb("--surface-2"),
            noteTextColor: rgb("--ink"),
            clusterBkg: rgb("--paper"),
            clusterBorder: rgb("--rule-strong"),
            edgeLabelBackground: rgb("--paper"),
          },
        });
        const id = `diagram-${reactId.replace(/[^a-zA-Z0-9]/g, "")}`;
        const { svg: rendered } = await mermaid.render(id, source);
        if (!cancelled) {
          setSvg(rendered);
          setFailed(false);
        }
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [source, reactId, resolvedTheme]);

  return (
    <figure className="my-8 border border-rule bg-paper">
      {title ? (
        <div className="flex items-center justify-between border-b border-rule px-4 py-2">
          <span className="label">Diagram</span>
          <span className="text-sm text-ink-2">{title}</span>
        </div>
      ) : null}
      <div className="overflow-x-auto p-4 md:p-6">
        {svg && !failed ? (
          <div
            className="diagram-render mx-auto flex justify-center"
            role="img"
            aria-label={description}
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-ink-2">{failed ? "This diagram could not be rendered. Description:" : "Loading diagram…"}</p>
            {failed ? <p className="text-ink">{description}</p> : null}
          </div>
        )}
      </div>
      <figcaption className="border-t border-rule px-4 py-3 text-sm text-ink-3">
        <span className="sr-only">Diagram description: </span>
        {svg && !failed ? description : null}
        <details className="mt-1">
          <summary className="cursor-pointer font-mono text-xs uppercase tracking-wide">View diagram source</summary>
          <pre className="mt-2 overflow-x-auto whitespace-pre font-mono text-xs leading-relaxed text-ink-2">{source}</pre>
        </details>
      </figcaption>
    </figure>
  );
}
