"use client";

import { Field, FieldGrid, FormSection, Select, Toggle } from "@/components/admin/fields";
import { SettingsForm } from "@/components/admin/settings-form";
import { cn } from "@/lib/utils";
import {
  ACCENT_LABELS,
  ACCENTS,
  CONTAINER_WIDTHS,
  MOTION_LEVELS,
  THEMES,
  TYPOGRAPHY_LABELS,
  TYPOGRAPHY_PRESETS,
  type AppearanceSettings,
} from "@/lib/validation/settings";

export function AppearanceForm({ initial }: { initial: AppearanceSettings }) {
  return (
    <SettingsForm settingsKey="appearance" initial={initial} title="Appearance" description="Curated design tokens and layout variants. Arbitrary CSS is intentionally not supported.">
      {({ value: v, set }) => (
        <>
          <FormSection title="Accent colour" description="Each preset has light and dark variants that meet WCAG AA contrast.">
            <fieldset>
              <legend className="sr-only">Accent colour</legend>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {ACCENTS.map((accent) => (
                  <label key={accent} className={cn("flex cursor-pointer items-center gap-3 border p-3", v.accent === accent ? "border-ink" : "border-rule hover:border-rule-strong")}>
                    <input type="radio" name="accent" value={accent} checked={v.accent === accent} onChange={() => set(["accent"], accent)} className="accent-[rgb(var(--accent))]" />
                    <span className="flex gap-1" aria-hidden>
                      <span className="h-5 w-5 border border-rule" style={{ background: ACCENT_LABELS[accent].light }} />
                      <span className="h-5 w-5 border border-rule" style={{ background: ACCENT_LABELS[accent].dark }} />
                    </span>
                    <span className="text-sm">{ACCENT_LABELS[accent].label}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </FormSection>
          <FormSection title="Theme & typography">
            <FieldGrid>
              <Field label="Default theme" hint="Visitors can still switch with the toggle; their choice is remembered.">
                {({ id }) => (
                  <Select id={id} value={v.defaultTheme} onChange={(e) => set(["defaultTheme"], e.target.value)}>
                    {THEMES.map((t) => (
                      <option key={t} value={t}>
                        {t === "system" ? "Follow the visitor’s system" : t.charAt(0).toUpperCase() + t.slice(1)}
                      </option>
                    ))}
                  </Select>
                )}
              </Field>
              <Field label="Typography preset">
                {({ id }) => (
                  <Select id={id} value={v.typography} onChange={(e) => set(["typography"], e.target.value)}>
                    {TYPOGRAPHY_PRESETS.map((t) => (
                      <option key={t} value={t}>
                        {TYPOGRAPHY_LABELS[t]}
                      </option>
                    ))}
                  </Select>
                )}
              </Field>
            </FieldGrid>
          </FormSection>
          <FormSection title="Layout">
            <FieldGrid>
              <Field label="Content width">
                {({ id }) => (
                  <Select id={id} value={v.container} onChange={(e) => set(["container"], e.target.value)}>
                    {CONTAINER_WIDTHS.map((c) => (
                      <option key={c} value={c}>
                        {c === "narrow" ? "Narrow (1080px)" : c === "wide" ? "Wide (1400px)" : "Default (1240px)"}
                      </option>
                    ))}
                  </Select>
                )}
              </Field>
              <Field label="Projects index layout">
                {({ id }) => (
                  <Select id={id} value={v.projectsLayout} onChange={(e) => set(["projectsLayout"], e.target.value)}>
                    <option value="ledger">Ledger (dense list)</option>
                    <option value="grid">Grid (image-led)</option>
                  </Select>
                )}
              </Field>
              <Field label="Footer layout">
                {({ id }) => (
                  <Select id={id} value={v.footerLayout} onChange={(e) => set(["footerLayout"], e.target.value)}>
                    <option value="full">Full (index, links, colophon)</option>
                    <option value="minimal">Minimal (single row)</option>
                  </Select>
                )}
              </Field>
              <Field label="Motion" hint="The visitor’s reduced-motion preference always wins.">
                {({ id }) => (
                  <Select id={id} value={v.motion} onChange={(e) => set(["motion"], e.target.value)}>
                    {MOTION_LEVELS.map((m) => (
                      <option key={m} value={m}>
                        {m === "full" ? "Subtle transitions" : m === "reduced" ? "Reduced" : "None"}
                      </option>
                    ))}
                  </Select>
                )}
              </Field>
            </FieldGrid>
            <Toggle label="Sticky header" description="Keep the navigation visible while scrolling." checked={v.stickyHeader} onChange={(c) => set(["stickyHeader"], c)} />
          </FormSection>
          <FormSection title="Sections" description="Disabled sections disappear from navigation, the homepage, the sitemap, and return 404.">
            <Toggle label="Case studies" checked={v.caseStudiesEnabled} onChange={(c) => set(["caseStudiesEnabled"], c)} />
            <Toggle label="Writing / engineering notes" checked={v.writingEnabled} onChange={(c) => set(["writingEnabled"], c)} />
          </FormSection>
        </>
      )}
    </SettingsForm>
  );
}
