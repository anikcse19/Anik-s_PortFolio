"use client";

import type { ReactNode } from "react";
import { AddButton, ListControls, moveItem } from "@/components/admin/fields";

/** Ordered, removable list of sub-forms (services, steps, FAQs, ...). */
export function Repeater<T>({
  items,
  onChange,
  max,
  itemLabel,
  make,
  children,
}: {
  items: T[];
  onChange: (next: T[]) => void;
  max: number;
  itemLabel: string;
  make: () => T;
  children: (item: T, index: number) => ReactNode;
}) {
  return (
    <>
      <ol className="space-y-4">
        {items.map((item, i) => (
          <li key={i} className="space-y-4 border border-rule p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-ink-2">
                {itemLabel} {i + 1}
              </p>
              <ListControls index={i} count={items.length} label={`${itemLabel} ${i + 1}`} onMove={(f, t) => onChange(moveItem(items, f, t))} onRemove={(idx) => onChange(items.filter((_, j) => j !== idx))} />
            </div>
            {children(item, i)}
          </li>
        ))}
      </ol>
      <AddButton onClick={() => onChange([...items, make()])} disabled={items.length >= max}>
        Add {itemLabel.toLowerCase()}
      </AddButton>
    </>
  );
}
