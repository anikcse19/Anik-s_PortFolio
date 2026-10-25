import { SiteImage } from "@/components/ui/site-image";
import { cn } from "@/lib/utils";

function hostname(url: string | undefined): string {
  if (!url) return "";
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

/**
 * Presents a website screenshot inside minimal browser chrome, so raw
 * screenshots read as products rather than pasted images.
 */
export function BrowserFrame({
  src,
  alt,
  url,
  sizes,
  priority,
  placeholderLabel,
  className,
  imageClassName,
}: {
  src: string | undefined;
  alt: string;
  url?: string;
  sizes: string;
  priority?: boolean;
  placeholderLabel?: string;
  className?: string;
  imageClassName?: string;
}) {
  const host = hostname(url);
  return (
    <div className={cn("overflow-hidden rounded-lg border border-rule bg-surface shadow-[0_24px_60px_-30px_rgb(0_0_0/0.6)]", className)}>
      <div className="flex h-8 items-center gap-3 border-b border-rule bg-surface-2/60 px-3" aria-hidden>
        <span className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-rule-strong" />
          <span className="h-2.5 w-2.5 rounded-full bg-rule-strong" />
          <span className="h-2.5 w-2.5 rounded-full bg-rule-strong" />
        </span>
        {host ? <span className="mx-auto truncate rounded bg-paper/60 px-3 py-0.5 font-mono text-[0.6875rem] text-ink-3">{host}</span> : null}
        {host ? <span className="w-[2.625rem]" /> : null}
      </div>
      <SiteImage src={src} alt={alt} aspect="16 / 10" sizes={sizes} priority={priority} placeholderLabel={placeholderLabel} imgClassName={cn("object-top", imageClassName)} />
    </div>
  );
}
