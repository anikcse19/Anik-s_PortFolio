"use client";

import { AddButton, Input, ListControls, moveItem } from "@/components/admin/fields";
import type { Metric } from "@/lib/validation/common";

/** Editable list of impact numbers: a short value ("40%") and what it measures ("faster checkout"). */
export function MetricList({
  value,
  onChange,
  errorAt,
  max = 4,
  hint,
}: {
  value: Metric[];
  onChange: (next: Metric[]) => void;
  errorAt: (index: number, key: "value" | "label") => string | undefined;
  max?: number;
  hint?: string;
}) {
  return (
    <fieldset>
      <legend className="mb-1.5 text-sm font-medium text-ink">Impact numbers</legend>
      <p className="mb-3 text-xs text-ink-3">
        {hint ?? "Short, verifiable results, e.g. “3×” / “faster page loads”, “50k+” / “monthly active users”. Only numbers you can stand behind."}
      </p>
      <ol className="space-y-2">
        {value.map((m, i) => (
          <li key={i} className="grid items-start gap-2 md:grid-cols-[8rem_minmax(0,1fr)_auto]">
            <div>
              <Input aria-label={`Metric ${i + 1} value`} placeholder="40%" invalid={Boolean(errorAt(i, "value"))} value={m.value} onChange={(e) => onChange(value.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)))} />
              {errorAt(i, "value") ? <p className="mt-1 text-sm text-danger">{errorAt(i, "value")}</p> : null}
            </div>
            <div>
              <Input aria-label={`Metric ${i + 1} label`} placeholder="faster checkout" invalid={Boolean(errorAt(i, "label"))} value={m.label} onChange={(e) => onChange(value.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} />
              {errorAt(i, "label") ? <p className="mt-1 text-sm text-danger">{errorAt(i, "label")}</p> : null}
            </div>
            <ListControls index={i} count={value.length} label={`metric ${i + 1}`} onMove={(f, t) => onChange(moveItem(value, f, t))} onRemove={(idx) => onChange(value.filter((_, j) => j !== idx))} />
          </li>
        ))}
      </ol>
      <div className="mt-3">
        <AddButton onClick={() => onChange([...value, { value: "", label: "" }])} disabled={value.length >= max}>
          Add metric
        </AddButton>
      </div>
    </fieldset>
  );
}
