"use client";

import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Code,
  Heading2,
  Heading3,
  Italic,
  Link2,
  Link2Off,
  List,
  ListOrdered,
  Minus,
  Quote,
  Redo2,
  SquareCode,
  Undo2,
} from "lucide-react";
import { useEffect, useId, type ReactNode } from "react";
import { isSafeHref } from "@/lib/urls";
import { cn } from "@/lib/utils";

/**
 * Tiptap-based editor limited to the same formatting the server sanitizer
 * allows (see lib/sanitize.ts), so what you see is what gets published.
 */
export function RichTextEditor({
  label,
  value,
  onChange,
  hint,
  error,
  minHeight = "10rem",
  optional = true,
}: {
  label: string;
  value: string;
  onChange: (html: string) => void;
  hint?: ReactNode;
  error?: string;
  minHeight?: string;
  optional?: boolean;
}) {
  const id = useId();
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        underline: false,
        link: {
          openOnClick: false,
          autolink: true,
          defaultProtocol: "https",
          protocols: ["http", "https", "mailto"],
          isAllowedUri: (url) => isSafeHref(url),
        },
      }),
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class: "prose-journal max-w-none px-4 py-3 focus:outline-none",
        "aria-labelledby": `${id}-label`,
        ...(hint ? { "aria-describedby": `${id}-hint` } : {}),
        role: "textbox",
        "aria-multiline": "true",
      },
    },
    onUpdate: ({ editor: e }) => {
      const html = e.getHTML();
      onChange(html === "<p></p>" ? "" : html);
    },
  });

  // Keep the editor in sync when the value is replaced from outside (e.g. after reload).
  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    const normalized = value || "<p></p>";
    if (current !== normalized && !editor.isFocused) editor.commands.setContent(value || "", { emitUpdate: false });
  }, [value, editor]);

  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between">
        <span id={`${id}-label`} className="text-sm font-medium text-ink">
          {label}
        </span>
        {optional ? <span className="text-xs text-ink-3">Optional</span> : null}
      </div>
      <div className={cn("rounded-sm border bg-paper", error ? "border-danger" : "border-rule-strong focus-within:border-ink")}>
        <Toolbar editor={editor} />
        <div style={{ minHeight }} className="cursor-text" onClick={() => editor?.commands.focus()}>
          <EditorContent editor={editor} />
        </div>
      </div>
      {hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-ink-3">
          {hint}
        </p>
      ) : null}
      {error ? <p className="mt-1.5 text-sm text-danger">{error}</p> : null}
    </div>
  );
}

function Toolbar({ editor }: { editor: Editor | null }) {
  const state = useEditorState({
    editor,
    selector: ({ editor: e }) =>
      e
        ? {
            bold: e.isActive("bold"),
            italic: e.isActive("italic"),
            code: e.isActive("code"),
            h2: e.isActive("heading", { level: 2 }),
            h3: e.isActive("heading", { level: 3 }),
            bullet: e.isActive("bulletList"),
            ordered: e.isActive("orderedList"),
            quote: e.isActive("blockquote"),
            codeBlock: e.isActive("codeBlock"),
            link: e.isActive("link"),
            canUndo: e.can().undo(),
            canRedo: e.can().redo(),
          }
        : null,
  });
  if (!editor || !state) return <div className="h-10 border-b border-rule" />;

  const setLink = () => {
    const previous = (editor.getAttributes("link").href as string | undefined) ?? "";
    const url = window.prompt("Link URL (https://…, /path or mailto:)", previous);
    if (url === null) return;
    if (url.trim() === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    if (!isSafeHref(url.trim())) {
      window.alert("That link isn’t allowed. Use https://, a site path like /projects, or mailto:.");
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run();
  };

  const btn = (label: string, active: boolean, onClick: () => void, icon: ReactNode, disabled = false) => (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={active}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={cn("inline-flex h-8 w-8 items-center justify-center rounded-sm text-ink-2 hover:bg-surface hover:text-ink disabled:opacity-30", active && "bg-surface-2 text-ink")}
    >
      {icon}
    </button>
  );
  const i = "h-4 w-4";

  return (
    <div role="toolbar" aria-label="Formatting" className="flex flex-wrap items-center gap-0.5 border-b border-rule px-1.5 py-1">
      {btn("Heading 2", state.h2, () => editor.chain().focus().toggleHeading({ level: 2 }).run(), <Heading2 className={i} aria-hidden />)}
      {btn("Heading 3", state.h3, () => editor.chain().focus().toggleHeading({ level: 3 }).run(), <Heading3 className={i} aria-hidden />)}
      <span className="mx-1 h-5 w-px bg-rule" aria-hidden />
      {btn("Bold", state.bold, () => editor.chain().focus().toggleBold().run(), <Bold className={i} aria-hidden />)}
      {btn("Italic", state.italic, () => editor.chain().focus().toggleItalic().run(), <Italic className={i} aria-hidden />)}
      {btn("Inline code", state.code, () => editor.chain().focus().toggleCode().run(), <Code className={i} aria-hidden />)}
      {btn(state.link ? "Edit link" : "Add link", state.link, setLink, <Link2 className={i} aria-hidden />)}
      {state.link ? btn("Remove link", false, () => editor.chain().focus().extendMarkRange("link").unsetLink().run(), <Link2Off className={i} aria-hidden />) : null}
      <span className="mx-1 h-5 w-px bg-rule" aria-hidden />
      {btn("Bulleted list", state.bullet, () => editor.chain().focus().toggleBulletList().run(), <List className={i} aria-hidden />)}
      {btn("Numbered list", state.ordered, () => editor.chain().focus().toggleOrderedList().run(), <ListOrdered className={i} aria-hidden />)}
      {btn("Quote", state.quote, () => editor.chain().focus().toggleBlockquote().run(), <Quote className={i} aria-hidden />)}
      {btn("Code block", state.codeBlock, () => editor.chain().focus().toggleCodeBlock().run(), <SquareCode className={i} aria-hidden />)}
      {btn("Divider", false, () => editor.chain().focus().setHorizontalRule().run(), <Minus className={i} aria-hidden />)}
      <span className="ml-auto flex">
        {btn("Undo", false, () => editor.chain().focus().undo().run(), <Undo2 className={i} aria-hidden />, !state.canUndo)}
        {btn("Redo", false, () => editor.chain().focus().redo().run(), <Redo2 className={i} aria-hidden />, !state.canRedo)}
      </span>
    </div>
  );
}
