"use client";

import { Field, FieldGrid, FormSection, Input, Notice, TextArea, Toggle } from "@/components/admin/fields";
import { SettingsForm } from "@/components/admin/settings-form";
import { SEO_PAGES, type SeoSettings } from "@/lib/validation/settings";

const PAGE_LABELS: Record<(typeof SEO_PAGES)[number], string> = {
  home: "Homepage",
  projects: "Projects index",
  caseStudies: "Case studies index",
  writing: "Writing index",
  about: "About",
  experience: "Experience",
  contact: "Contact",
};

export function SeoForm({ initial }: { initial: SeoSettings }) {
  return (
    <SettingsForm settingsKey="seo" initial={initial} title="SEO" description="Site-wide defaults. Projects, case studies and articles have their own overrides.">
      {({ value: v, set, error }) => (
        <>
          <FormSection title="Defaults">
            <FieldGrid>
              <Field label="Site name" optional error={error(["siteName"])}>
                {({ id }) => <Input id={id} value={v.siteName} onChange={(e) => set(["siteName"], e.target.value)} />}
              </Field>
              <Field label="Title template" error={error(["titleTemplate"])} hint="%s is replaced by the page title.">
                {({ id, invalid }) => <Input id={id} invalid={invalid} value={v.titleTemplate} onChange={(e) => set(["titleTemplate"], e.target.value)} />}
              </Field>
            </FieldGrid>
            <Field label="Default title" error={error(["defaultTitle"])} hint={`${v.defaultTitle.length}/70`}>
              {({ id, invalid }) => <Input id={id} invalid={invalid} maxLength={70} value={v.defaultTitle} onChange={(e) => set(["defaultTitle"], e.target.value)} />}
            </Field>
            <Field label="Default description" error={error(["defaultDescription"])} hint={`${v.defaultDescription.length}/170`}>
              {({ id, invalid }) => <TextArea id={id} invalid={invalid} rows={3} maxLength={170} value={v.defaultDescription} onChange={(e) => set(["defaultDescription"], e.target.value)} />}
            </Field>
            <FieldGrid>
              <Field label="Default social image URL" optional error={error(["ogImage"])} hint="1200×630 recommended.">
                {({ id, invalid }) => <Input id={id} type="url" invalid={invalid} value={v.ogImage} onChange={(e) => set(["ogImage"], e.target.value)} className="font-mono text-sm" />}
              </Field>
              <Field label="X / Twitter handle" optional error={error(["twitterHandle"])}>
                {({ id, invalid }) => <Input id={id} invalid={invalid} value={v.twitterHandle} onChange={(e) => set(["twitterHandle"], e.target.value)} placeholder="@handle" />}
              </Field>
            </FieldGrid>
          </FormSection>
          <FormSection title="Indexing">
            <Toggle label="Hide the whole site from search engines" description="Adds noindex to every page and disallows crawling in robots.txt. Useful for staging." checked={v.noindex} onChange={(c) => set(["noindex"], c)} />
            {v.noindex ? <Notice tone="warning">Search engines are asked not to index this site.</Notice> : null}
          </FormSection>
          <FormSection title="Page titles & descriptions" description="Leave empty to use sensible defaults. Index-page descriptions also appear as the page intro.">
            {SEO_PAGES.map((page) => (
              <div key={page} className="grid gap-3 border-b border-rule pb-4 md:grid-cols-[10rem_minmax(0,1fr)]">
                <p className="pt-2 text-sm font-medium">{PAGE_LABELS[page]}</p>
                <div className="space-y-2">
                  <Input aria-label={`${PAGE_LABELS[page]} title`} placeholder="Title" maxLength={70} value={v.pages[page].title} invalid={Boolean(error(["pages", page, "title"]))} onChange={(e) => set(["pages", page, "title"], e.target.value)} />
                  <TextArea aria-label={`${PAGE_LABELS[page]} description`} placeholder="Description" rows={2} maxLength={170} value={v.pages[page].description} invalid={Boolean(error(["pages", page, "description"]))} onChange={(e) => set(["pages", page, "description"], e.target.value)} />
                </div>
              </div>
            ))}
          </FormSection>
        </>
      )}
    </SettingsForm>
  );
}
