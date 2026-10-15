"use client";

import { useState } from "react";
import { Diagram } from "@/components/ui/diagram";
import { CALLOUT_TONES, CODE_LANGUAGES, cryptoId, type BlockType, type ContentBlock } from "@/lib/validation/blocks";
import { AddButton, Field, Input, ListControls, moveItem, Select, TextArea } from "./fields";
import { ImageUrlField } from "./image-url-field";
import { RichTextEditor } from "./rich-text-editor";

const BLOCK_LABELS: Record<BlockType, string> = {
  rich: "Text",
  code: "Code",
  callout: "Callout",
  diagram: "Diagram",
  image: "Image",
};

function newBlock(type: BlockType): ContentBlock {
  const id = cryptoId();
  switch (type) {
    case "rich":
      return { id, type, html: "" };
    case "code":
      return { id, type, language: "typescript", filename: "", code: "" };
    case "callout":
      return { id, type, tone: "note", title: "", html: "" };
    case "diagram":
      return {
        id,
        type,
        title: "",
        source: "flowchart LR\n  client[Client] --> api[API]\n  api --> db[(Database)]",
        description: "",
      };
    case "image":
      return { id, type, image: { url: "", alt: "", caption: "" } };
  }
}

/**
 * Editor for an ordered list of structured blocks. `errorAt(index, field)`
 * maps server validation errors back to individual blocks.
 */
export function BlockEditor({
  value,
  onChange,
  errorAt,
  label = "Content",
}: {
  value: ContentBlock[];
  onChange: (blocks: ContentBlock[]) => void;
  errorAt: (index: number, field: string) => string | undefined;
  label?: string;
}) {
  const update = (index: number, block: ContentBlock) => onChange(value.map((b, i) => (i === index ? block : b)));

  return (
    <div className="space-y-4">
      {value.length === 0 ? <p className="text-sm text-ink-3">No content yet. Add a block below.</p> : null}
      {value.map((block, index) => (
        <div key={block.id} className="border border-rule">
          <div className="flex items-center justify-between border-b border-rule bg-surface px-3 py-1.5">
            <span className="label">
              {index + 1}. {BLOCK_LABELS[block.type]}
            </span>
            <ListControls
              index={index}
              count={value.length}
              label={`${BLOCK_LABELS[block.type].toLowerCase()} block ${index + 1}`}
              onMove={(from, to) => onChange(moveItem(value, from, to))}
              onRemove={(i) => onChange(value.filter((_, j) => j !== i))}
            />
          </div>
          <div className="space-y-4 p-4">
            <BlockFields block={block} onChange={(b) => update(index, b)} error={(field) => errorAt(index, field)} />
          </div>
        </div>
      ))}
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label={`Add to ${label.toLowerCase()}`}>
        {(Object.keys(BLOCK_LABELS) as BlockType[]).map((type) => (
          <AddButton key={type} onClick={() => onChange([...value, newBlock(type)])} disabled={value.length >= 120}>
            {BLOCK_LABELS[type]}
          </AddButton>
        ))}
      </div>
    </div>
  );
}

function BlockFields({ block, onChange, error }: { block: ContentBlock; onChange: (b: ContentBlock) => void; error: (field: string) => string | undefined }) {
  switch (block.type) {
    case "rich":
      return <RichTextEditor label="Text" value={block.html} onChange={(html) => onChange({ ...block, html })} error={error("html")} optional={false} />;
    case "code":
      return (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Language" error={error("language")}>
              {({ id }) => (
                <Select id={id} value={block.language} onChange={(e) => onChange({ ...block, language: e.target.value as typeof block.language })}>
                  {CODE_LANGUAGES.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
            <Field label="File name" optional error={error("filename")}>
              {({ id }) => <Input id={id} value={block.filename} onChange={(e) => onChange({ ...block, filename: e.target.value })} placeholder="e.g. lib/rate-limit.ts" />}
            </Field>
          </div>
          <Field label="Code" error={error("code")}>
            {({ id, describedBy, invalid }) => (
              <TextArea id={id} aria-describedby={describedBy} invalid={invalid} rows={10} spellCheck={false} value={block.code} onChange={(e) => onChange({ ...block, code: e.target.value })} className="font-mono text-[0.8125rem]" />
            )}
          </Field>
        </>
      );
    case "callout":
      return (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Type">
              {({ id }) => (
                <Select id={id} value={block.tone} onChange={(e) => onChange({ ...block, tone: e.target.value as typeof block.tone })}>
                  {CALLOUT_TONES.map((t) => (
                    <option key={t} value={t}>
                      {t === "tradeoff" ? "Trade-off" : t.charAt(0).toUpperCase() + t.slice(1)}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
            <Field label="Title" optional error={error("title")}>
              {({ id }) => <Input id={id} value={block.title} onChange={(e) => onChange({ ...block, title: e.target.value })} />}
            </Field>
          </div>
          <RichTextEditor label="Body" value={block.html} onChange={(html) => onChange({ ...block, html })} minHeight="5rem" error={error("html")} optional={false} />
        </>
      );
    case "diagram":
      return <DiagramFields block={block} onChange={onChange} error={error} />;
    case "image":
      return (
        <ImageUrlField
          label="Image"
          value={block.image}
          required
          aspect="16 / 9"
          aspectLabel="16:9"
          onChange={(image) => onChange({ ...block, image: image ?? { url: "", alt: "", caption: "" } })}
          errors={{ url: error("image.url"), alt: error("image.alt"), caption: error("image.caption") }}
        />
      );
  }
}

function DiagramFields({
  block,
  onChange,
  error,
}: {
  block: Extract<ContentBlock, { type: "diagram" }>;
  onChange: (b: ContentBlock) => void;
  error: (field: string) => string | undefined;
}) {
  const [preview, setPreview] = useState(false);
  return (
    <>
      <Field label="Title" optional error={error("title")}>
        {({ id }) => <Input id={id} value={block.title} onChange={(e) => onChange({ ...block, title: e.target.value })} placeholder="e.g. Request lifecycle" />}
      </Field>
      <Field
        label="Mermaid source"
        error={error("source")}
        hint={
          <>
            Uses{" "}
            <a href="https://mermaid.js.org/intro/syntax-reference.html" target="_blank" rel="noopener noreferrer" className="underline">
              Mermaid syntax
            </a>{" "}
            (flowchart, sequenceDiagram, erDiagram, …). Rendered safely in strict mode.
          </>
        }
      >
        {({ id, describedBy, invalid }) => (
          <TextArea id={id} aria-describedby={describedBy} invalid={invalid} rows={8} spellCheck={false} value={block.source} onChange={(e) => onChange({ ...block, source: e.target.value })} className="font-mono text-[0.8125rem]" />
        )}
      </Field>
      <Field label="Text description" error={error("description")} hint="Required. Explains the diagram for screen-reader users and appears if the diagram cannot render.">
        {({ id, describedBy, invalid }) => (
          <TextArea id={id} aria-describedby={describedBy} invalid={invalid} rows={3} value={block.description} onChange={(e) => onChange({ ...block, description: e.target.value })} />
        )}
      </Field>
      <div>
        <button type="button" className="text-sm underline" onClick={() => setPreview((p) => !p)}>
          {preview ? "Hide preview" : "Preview diagram"}
        </button>
        {preview ? <Diagram source={block.source} title={block.title} description={block.description || "Diagram preview"} /> : null}
      </div>
    </>
  );
}
