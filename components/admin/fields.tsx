"use client";

import { ArrowDown, ArrowUp, Plus, Trash2, X } from "lucide-react";
import {
  forwardRef,
  useId,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import { cn, slugify } from "@/lib/utils";

/* ----------------------------------------------------------------- Layout */

export function FormSection({
  title,
  description,
  children,
  invalid,
  aside,
}: {
  title: string;
  description?: ReactNode;
  children: ReactNode;
  invalid?: boolean;
  aside?: ReactNode;
}) {
  return (
    <section className={cn("border bg-paper", invalid ? "border-danger/60" : "border-rule")}>
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-rule px-5 py-4">
        <div>
          <h2 className="text-[0.9375rem] font-semibold text-ink">
            {title}
            {invalid ? <span className="ml-2 text-xs font-normal text-danger">Has errors</span> : null}
          </h2>
          {description ? <p className="mt-1 max-w-2xl text-sm text-ink-3">{description}</p> : null}
        </div>
        {aside}
      </header>
      <div className="space-y-5 p-5">{children}</div>
    </section>
  );
}

export function FieldGrid({ children, cols = 2 }: { children: ReactNode; cols?: 2 | 3 }) {
  return <div className={cn("grid gap-5", cols === 2 ? "md:grid-cols-2" : "md:grid-cols-3")}>{children}</div>;
}

type FieldProps = {
  label: string;
  hint?: ReactNode;
  error?: string;
  optional?: boolean;
  children: (props: { id: string; describedBy?: string; invalid: boolean }) => ReactNode;
  className?: string;
};

/** Label + control + hint + error, wired with aria-describedby / aria-invalid. */
export function Field({ label, hint, error, optional, children, className }: FieldProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 flex items-baseline justify-between gap-2 text-sm font-medium text-ink">
        <span>{label}</span>
        {optional ? <span className="text-xs font-normal text-ink-3">Optional</span> : null}
      </label>
      {children({ id, describedBy, invalid: Boolean(error) })}
      {hint ? (
        <p id={hintId} className="mt-1.5 text-xs leading-relaxed text-ink-3">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="mt-1.5 text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export const controlClass = (invalid?: boolean) =>
  cn(
    "w-full rounded-sm border bg-paper px-3 text-[0.9375rem] text-ink placeholder:text-ink-3 focus:outline-none disabled:opacity-60",
    invalid ? "border-danger focus:border-danger" : "border-rule-strong focus:border-ink",
  );

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }>(function Input(
  { invalid, className, ...props },
  ref,
) {
  return <input ref={ref} aria-invalid={invalid || undefined} className={cn(controlClass(invalid), "h-10", className)} {...props} />;
});

export const TextArea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }>(
  function TextArea({ invalid, className, rows = 4, ...props }, ref) {
    return (
      <textarea ref={ref} rows={rows} aria-invalid={invalid || undefined} className={cn(controlClass(invalid), "py-2 leading-relaxed", className)} {...props} />
    );
  },
);

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean }>(function Select(
  { invalid, className, children, ...props },
  ref,
) {
  return (
    <select ref={ref} aria-invalid={invalid || undefined} className={cn(controlClass(invalid), "h-10", className)} {...props}>
      {children}
    </select>
  );
});

/** Labelled checkbox rendered as a switch row. */
export function Toggle({ label, description, checked, onChange }: { label: string; description?: string; checked: boolean; onChange: (v: boolean) => void }) {
  const id = useId();
  return (
    <div className="flex items-start gap-3">
      <input id={id} type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-1 h-4 w-4 accent-[rgb(var(--accent))]" aria-describedby={description ? `${id}-d` : undefined} />
      <div>
        <label htmlFor={id} className="text-sm font-medium text-ink">
          {label}
        </label>
        {description ? (
          <p id={`${id}-d`} className="text-xs text-ink-3">
            {description}
          </p>
        ) : null}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------- Slug */

export function SlugInput({
  value,
  onChange,
  source,
  error,
  basePath,
}: {
  value: string;
  onChange: (v: string) => void;
  source: string;
  error?: string;
  basePath: string;
}) {
  return (
    <Field label="Slug" error={error} hint={<>Public URL: {basePath}/{value || "…"}</>}>
      {({ id, describedBy, invalid }) => (
        <div className="flex gap-2">
          <Input id={id} aria-describedby={describedBy} invalid={invalid} value={value} onChange={(e) => onChange(e.target.value.toLowerCase())} className="font-mono text-sm" maxLength={96} />
          <button type="button" onClick={() => onChange(slugify(source))} className="h-10 shrink-0 rounded-sm border border-rule-strong px-3 text-sm text-ink-2 hover:text-ink" disabled={!source}>
            From title
          </button>
        </div>
      )}
    </Field>
  );
}

/* --------------------------------------------------------------- Tag input */

export function TagInput({
  label,
  value,
  onChange,
  hint,
  error,
  placeholder = "Type and press Enter",
  max = 30,
  suggestions = [],
}: {
  label: string;
  value: string[];
  onChange: (v: string[]) => void;
  hint?: string;
  error?: string;
  placeholder?: string;
  max?: number;
  suggestions?: string[];
}) {
  const [draft, setDraft] = useState("");
  const listId = useId();
  const add = (raw: string) => {
    const items = raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const next = [...value];
    for (const item of items) if (!next.some((v) => v.toLowerCase() === item.toLowerCase()) && next.length < max) next.push(item);
    onChange(next);
    setDraft("");
  };
  return (
    <Field label={label} hint={hint ?? `Press Enter or comma to add. Up to ${max}.`} error={error} optional>
      {({ id, describedBy, invalid }) => (
        <div className={cn(controlClass(invalid), "flex min-h-10 flex-wrap items-center gap-1.5 px-2 py-1.5")}>
          {value.map((tag, i) => (
            <span key={tag} className="inline-flex items-center gap-1 rounded-sm bg-surface-2 py-0.5 pl-2 pr-1 text-sm">
              {tag}
              <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))} className="rounded-sm p-0.5 text-ink-3 hover:text-danger" aria-label={`Remove ${tag}`}>
                <X className="h-3 w-3" aria-hidden />
              </button>
            </span>
          ))}
          <input
            id={id}
            aria-describedby={describedBy}
            list={suggestions.length ? listId : undefined}
            value={draft}
            onChange={(e) => {
              if (e.target.value.endsWith(",")) add(e.target.value);
              else setDraft(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (draft.trim()) add(draft);
              } else if (e.key === "Backspace" && !draft && value.length) {
                onChange(value.slice(0, -1));
              }
            }}
            onBlur={() => draft.trim() && add(draft)}
            placeholder={value.length ? "" : placeholder}
            className="h-7 min-w-[8rem] flex-1 bg-transparent text-[0.9375rem] focus:outline-none"
          />
          {suggestions.length ? (
            <datalist id={listId}>
              {suggestions.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          ) : null}
        </div>
      )}
    </Field>
  );
}

/* --------------------------------------------------------- Ordered lists */

export function ListControls({
  index,
  count,
  onMove,
  onRemove,
  label,
}: {
  index: number;
  count: number;
  onMove: (from: number, to: number) => void;
  onRemove?: (index: number) => void;
  label: string;
}) {
  return (
    <div className="flex shrink-0 items-center gap-0.5">
      <IconButton label={`Move ${label} up`} disabled={index === 0} onClick={() => onMove(index, index - 1)}>
        <ArrowUp className="h-3.5 w-3.5" aria-hidden />
      </IconButton>
      <IconButton label={`Move ${label} down`} disabled={index === count - 1} onClick={() => onMove(index, index + 1)}>
        <ArrowDown className="h-3.5 w-3.5" aria-hidden />
      </IconButton>
      {onRemove ? (
        <IconButton label={`Remove ${label}`} onClick={() => onRemove(index)} danger>
          <Trash2 className="h-3.5 w-3.5" aria-hidden />
        </IconButton>
      ) : null}
    </div>
  );
}

export function IconButton({ label, onClick, disabled, danger, children }: { label: string; onClick: () => void; disabled?: boolean; danger?: boolean; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cn("inline-flex h-8 w-8 items-center justify-center rounded-sm text-ink-3 hover:bg-surface disabled:opacity-30", danger ? "hover:text-danger" : "hover:text-ink")}
    >
      {children}
    </button>
  );
}

export function moveItem<T>(list: T[], from: number, to: number): T[] {
  if (to < 0 || to >= list.length) return list;
  const copy = [...list];
  const [item] = copy.splice(from, 1);
  copy.splice(to, 0, item);
  return copy;
}

export function AddButton({ onClick, children, disabled }: { onClick: () => void; children: ReactNode; disabled?: boolean }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} className="inline-flex items-center gap-1.5 rounded-sm border border-dashed border-rule-strong px-3 py-1.5 text-sm text-ink-2 hover:border-ink hover:text-ink disabled:opacity-40">
      <Plus className="h-3.5 w-3.5" aria-hidden />
      {children}
    </button>
  );
}

/** Ordered list of short text entries (features, outcomes, achievements). */
export function StringList({
  label,
  value,
  onChange,
  errorAt,
  hint,
  itemLabel,
  max = 30,
  multiline = false,
}: {
  label: string;
  value: string[];
  onChange: (v: string[]) => void;
  errorAt: (index: number) => string | undefined;
  hint?: ReactNode;
  itemLabel: string;
  max?: number;
  multiline?: boolean;
}) {
  return (
    <fieldset>
      <legend className="mb-1.5 text-sm font-medium text-ink">{label}</legend>
      {hint ? <p className="mb-3 text-xs text-ink-3">{hint}</p> : null}
      <ol className="space-y-2">
        {value.map((item, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="w-6 pt-2.5 text-right font-mono text-xs text-ink-3">{i + 1}</span>
            <div className="flex-1">
              {multiline ? (
                <TextArea rows={2} value={item} aria-label={`${itemLabel} ${i + 1}`} invalid={Boolean(errorAt(i))} onChange={(e) => onChange(value.map((v, j) => (j === i ? e.target.value : v)))} />
              ) : (
                <Input value={item} aria-label={`${itemLabel} ${i + 1}`} invalid={Boolean(errorAt(i))} onChange={(e) => onChange(value.map((v, j) => (j === i ? e.target.value : v)))} />
              )}
              {errorAt(i) ? <p className="mt-1 text-sm text-danger">{errorAt(i)}</p> : null}
            </div>
            <ListControls index={i} count={value.length} label={itemLabel} onMove={(f, t) => onChange(moveItem(value, f, t))} onRemove={(idx) => onChange(value.filter((_, j) => j !== idx))} />
          </li>
        ))}
      </ol>
      <div className="mt-3">
        <AddButton onClick={() => onChange([...value, ""])} disabled={value.length >= max}>
          Add {itemLabel}
        </AddButton>
      </div>
    </fieldset>
  );
}

/* ------------------------------------------------------------ Status UI */

export function StatusBadge({ status }: { status: string }) {
  const published = status === "published";
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-sm px-1.5 py-0.5 font-mono text-[0.6875rem] uppercase tracking-wide", published ? "bg-success/10 text-success" : "bg-surface-2 text-ink-2")}>
      <span className={cn("h-1.5 w-1.5 rounded-full", published ? "bg-success" : "bg-ink-3")} aria-hidden />
      {published ? "Published" : "Draft"}
    </span>
  );
}

export function Notice({ tone = "info", children }: { tone?: "info" | "warning" | "danger" | "success"; children: ReactNode }) {
  const border = { info: "border-rule-strong", warning: "border-warning", danger: "border-danger", success: "border-success" }[tone];
  return <div className={cn("border-l-2 bg-surface px-4 py-3 text-sm text-ink-2", border)}>{children}</div>;
}
