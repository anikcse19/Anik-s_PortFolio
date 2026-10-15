import { htmlToText, sanitizeRichText } from "@/lib/sanitize";
import type { ContentBlock } from "@/lib/validation/blocks";
import type { CaseStudySection } from "@/lib/validation/content";

/** Sanitizes every HTML-bearing block. Called before persisting and before rendering. */
export function sanitizeBlocks(blocks: ContentBlock[]): ContentBlock[] {
  return blocks.map((block) => {
    if (block.type === "rich" || block.type === "callout") {
      return { ...block, html: sanitizeRichText(block.html) };
    }
    return block;
  });
}

export function sanitizeSections(sections: CaseStudySection[]): CaseStudySection[] {
  return sections.map((section) => ({ ...section, blocks: sanitizeBlocks(section.blocks) }));
}

export function blocksToText(blocks: ContentBlock[]): string {
  return blocks
    .map((block) => {
      switch (block.type) {
        case "rich":
        case "callout":
          return `${"title" in block ? block.title : ""} ${htmlToText(block.html)}`;
        case "code":
          return block.code;
        case "diagram":
          return `${block.title} ${block.description}`;
        case "image":
          return block.image.caption;
        default:
          return "";
      }
    })
    .join(" ");
}

const WORDS_PER_MINUTE = 220;

export function estimateReadingMinutes(blocks: ContentBlock[]): number {
  const words = blocksToText(blocks).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}
