"use client";

import { AddButton, Field, FormSection, Input, ListControls, moveItem, Notice, TextArea, Toggle } from "@/components/admin/fields";
import { SettingsForm } from "@/components/admin/settings-form";
import type { NavigationSettings } from "@/lib/validation/settings";

export function NavigationForm({ initial }: { initial: NavigationSettings }) {
  return (
    <SettingsForm settingsKey="navigation" initial={initial} title="Navigation & footer">
      {({ value: v, set, error }) => (
        <>
          <FormSection title="Header navigation" description="Links to disabled sections (writing, case studies) are hidden automatically.">
            <ol className="space-y-3">
              {v.items.map((item, i) => (
                <li key={i} className="grid gap-2 border-b border-rule pb-3 md:grid-cols-[10rem_minmax(0,1fr)_auto_auto] md:items-center">
                  <Input aria-label={`Item ${i + 1} label`} placeholder="Label" invalid={Boolean(error(["items", i, "label"]))} value={item.label} onChange={(e) => set(["items", i, "label"], e.target.value)} />
                  <div>
                    <Input aria-label={`Item ${i + 1} link`} placeholder="/projects" className="font-mono text-sm" invalid={Boolean(error(["items", i, "href"]))} value={item.href} onChange={(e) => set(["items", i, "href"], e.target.value)} />
                    {error(["items", i, "href"]) ? <p className="mt-1 text-sm text-danger">{error(["items", i, "href"])}</p> : null}
                  </div>
                  <Toggle label="Visible" checked={item.enabled} onChange={(c) => set(["items", i, "enabled"], c)} />
                  <ListControls index={i} count={v.items.length} label={`item ${item.label || i + 1}`} onMove={(f, t) => set(["items"], moveItem(v.items, f, t))} onRemove={(idx) => set(["items"], v.items.filter((_, j) => j !== idx))} />
                </li>
              ))}
            </ol>
            <AddButton onClick={() => set(["items"], [...v.items, { label: "", href: "/", enabled: true }])} disabled={v.items.length >= 10}>
              Add link
            </AddButton>
            <Notice>Paths: /projects, /case-studies, /experience, /writing, /about, /contact. External https:// links open in a new tab.</Notice>
          </FormSection>
          <FormSection title="Footer" description="Footer layout (full or minimal) is set under Appearance.">
            <Field label="Footer note" optional error={error(["footerNote"])}>
              {({ id }) => <TextArea id={id} rows={2} value={v.footerNote} onChange={(e) => set(["footerNote"], e.target.value)} />}
            </Field>
            <Toggle label="Show colophon" description="A short note about how the site is built." checked={v.showColophon} onChange={(c) => set(["showColophon"], c)} />
          </FormSection>
        </>
      )}
    </SettingsForm>
  );
}
