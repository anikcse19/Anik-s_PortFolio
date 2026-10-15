import { sanitizeRichText } from "@/lib/sanitize";
import type { ContentBlock } from "@/lib/validation/blocks";
import { cn } from "@/lib/utils";
import { Diagram } from "./diagram";
import { SiteImage } from "./site-image";

/** Renders CMS rich text. HTML is sanitized again at render time (defense in depth). */
export function RichText({ html, className }: { html: string; className?: string }) {
  const clean = sanitizeRichText(html);
  if (!clean) return null;
  return (
    <div
      className={cn("prose-journal", className)}
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}

const CALLOUT_LABELS = { note: "Note", decision: "Decision", tradeoff: "Trade-off", warning: "Caution" } as const;

export function Blocks({ blocks }: { blocks: ContentBlock[] }) {
  return (
    <div className="space-y-6">
      {blocks.map((block) => {
        switch (block.type) {
          case "rich":
            return <RichText key={block.id} html={block.html} />;
          case "code":
            return (
              <figure key={block.id} className="max-w-[80ch] overflow-hidden rounded border border-rule bg-surface">
                <figcaption className="flex items-center justify-between border-b border-rule px-4 py-2">
                  <span className="font-mono text-xs text-ink-2">{block.filename || " "}</span>
                  <span className="label">{block.language}</span>
                </figcaption>
                <pre className="overflow-x-auto p-4 font-mono text-[0.8125rem] leading-relaxed text-ink">
                  <code>{block.code}</code>
                </pre>
              </figure>
            );
          case "callout":
            return (
              <aside
                key={block.id}
                className={cn(
                  "max-w-prose border-l-2 bg-surface px-5 py-4",
                  block.tone === "warning" ? "border-warning" : "border-accent",
                )}
                aria-label={block.title || CALLOUT_LABELS[block.tone]}
              >
                <p className="label mb-2">
                  {CALLOUT_LABELS[block.tone]}
                  {block.title ? <span className="ml-2 normal-case tracking-normal text-ink">— {block.title}</span> : null}
                </p>
                <RichText html={block.html} className="text-[0.975rem]" />
              </aside>
            );
          case "diagram":
            return <Diagram key={block.id} source={block.source} title={block.title} description={block.description} />;
          case "image":
            return (
              <figure key={block.id} className="space-y-2">
                <SiteImage
                  src={block.image.url}
                  alt={block.image.alt}
                  aspect="16 / 9"
                  fit="contain"
                  sizes="(min-width: 1024px) 800px, 100vw"
                  className="border border-rule"
                />
                {block.image.caption ? <figcaption className="text-sm text-ink-3">{block.image.caption}</figcaption> : null}
              </figure>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
