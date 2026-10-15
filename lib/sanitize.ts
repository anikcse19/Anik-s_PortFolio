import sanitizeHtml from "sanitize-html";

/**
 * Allow-list sanitizer for rich text produced by the admin editor.
 * Runs on every write and again on every render (defense in depth), so a
 * compromised database row still cannot inject scripts into public pages.
 */
const OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    "p",
    "br",
    "h2",
    "h3",
    "h4",
    "strong",
    "b",
    "em",
    "i",
    "u",
    "s",
    "code",
    "pre",
    "blockquote",
    "ul",
    "ol",
    "li",
    "a",
    "hr",
  ],
  allowedAttributes: {
    a: ["href", "title", "rel", "target"],
    code: ["class"],
    ol: ["start"],
  },
  allowedClasses: {
    code: [/^language-[a-z0-9+-]+$/],
  },
  allowedSchemes: ["http", "https", "mailto"],
  allowedSchemesByTag: {},
  allowProtocolRelative: false,
  disallowedTagsMode: "discard",
  enforceHtmlBoundary: false,
  transformTags: {
    a: (tagName, attribs) => {
      const href = attribs.href ?? "";
      const external = /^https?:\/\//i.test(href);
      const next: Record<string, string> = { href };
      if (attribs.title) next.title = attribs.title;
      if (external) {
        next.rel = "noopener noreferrer nofollow";
        next.target = "_blank";
      }
      return { tagName, attribs: next };
    },
    b: "strong",
    i: "em",
    h1: "h2",
  },
  exclusiveFilter: (frame) => frame.tag === "a" && !frame.attribs.href,
};

export function sanitizeRichText(html: string | null | undefined): string {
  if (!html) return "";
  const clean = sanitizeHtml(html, OPTIONS).trim();
  // Tiptap emits "<p></p>" for an empty document.
  return clean === "<p></p>" ? "" : clean;
}

/** Plain-text projection of rich text (used for reading time and meta descriptions). */
export function htmlToText(html: string): string {
  return sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} })
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}
