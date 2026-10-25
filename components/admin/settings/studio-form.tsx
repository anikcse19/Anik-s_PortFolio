"use client";

import { Field, FieldGrid, FormSection, Input, Notice, StringList, TagInput, TextArea, Toggle } from "@/components/admin/fields";
import { SettingsForm } from "@/components/admin/settings-form";
import { MetricList } from "@/components/admin/metric-list";
import { Repeater } from "@/components/admin/repeater";
import { ItemPicker, type Option } from "@/components/admin/settings/homepage-editor";
import type { StudioSettings } from "@/lib/validation/settings";
import { STUDIO_BASE } from "@/lib/zones";

type Path = (string | number)[];

export function StudioSettingsForm({ initial, projects, gateConfigured }: { initial: StudioSettings; projects: Option[]; gateConfigured: boolean }) {
  return (
    <SettingsForm
      settingsKey="studio"
      initial={initial}
      title="Studio"
      description={
        <>
          Your service-provider presentation at <code>{STUDIO_BASE}</code>, for clients who want to hire you for a project.
        </>
      }
    >
      {({ value: v, set, error, hasErrorsUnder }) => {
        const text = (path: Path, label: string, opts: { optional?: boolean; hint?: string; rows?: number } = {}) => (
          <Field label={label} optional={opts.optional} hint={opts.hint} error={error(path)}>
            {({ id, invalid }) => {
              const value = String(path.reduce<unknown>((acc, k) => (acc as Record<string | number, unknown>)[k], v) ?? "");
              return opts.rows ? (
                <TextArea id={id} rows={opts.rows} invalid={invalid} value={value} onChange={(e) => set(path, e.target.value)} />
              ) : (
                <Input id={id} invalid={invalid} value={value} onChange={(e) => set(path, e.target.value)} />
              );
            }}
          </Field>
        );

        return (
          <>
            <FormSection title="Access">
              {gateConfigured ? (
                <Notice tone="success">
                  The password gate is on. Visitors who land on the portfolio need the password to open the studio, and visitors who land on the studio need it to open
                  the portfolio. Share <code>{STUDIO_BASE}</code> with clients directly.
                </Notice>
              ) : (
                <Notice tone="warning">
                  SITE_GATE_PASSWORD is not set, so nobody can cross between the portfolio and the studio. Each still works when opened directly. Set the variable to
                  allow crossing with a password.
                </Notice>
              )}
            </FormSection>

            <FormSection title="Brand & hero" invalid={["brandName", "tagline", "eyebrow", "headline", "subheadline", "availability", "trustLine"].some((k) => hasErrorsUnder([k]))}>
              <FieldGrid>
                {text(["brandName"], "Brand name", { optional: true, hint: "Defaults to your name from Profile." })}
                {text(["tagline"], "Tagline", { optional: true, hint: "Shown next to the brand, e.g. “Custom software development”." })}
              </FieldGrid>
              {text(["eyebrow"], "Eyebrow", { optional: true, hint: "Small line above the headline, e.g. “Senior engineering partner for startups”." })}
              {text(["headline"], "Headline", { optional: true, rows: 2 })}
              {text(["subheadline"], "Supporting text", { optional: true, rows: 3 })}
              {text(["availability"], "Availability badge", { optional: true, hint: "e.g. “Booking projects for January”. Leave empty to hide." })}
              {text(["trustLine"], "Trust line", { optional: true, hint: "One factual line of social proof under the hero. Keep it true and verifiable." })}
            </FormSection>

            <FormSection title="Impact numbers" description="Up to four results shown under the hero. Leave empty to show facts computed from your experience and projects." invalid={hasErrorsUnder(["metrics"])}>
              <MetricList value={v.metrics} onChange={(next) => set(["metrics"], next)} errorAt={(i, k) => error(["metrics", i, k])} />
            </FormSection>

            <FormSection title="Commitments" description="Up to four short promises about how you work, shown in the “Why work with me” section." invalid={hasErrorsUnder(["highlights"])}>
              <Repeater items={v.highlights} onChange={(next) => set(["highlights"], next)} max={4} itemLabel="Highlight" make={() => ({ value: "", label: "" })}>
                {(_, i) => (
                  <div className="grid gap-4 md:grid-cols-[10rem_1fr]">
                    {text(["highlights", i, "value"], "Value")}
                    {text(["highlights", i, "label"], "Label")}
                  </div>
                )}
              </Repeater>
            </FormSection>

            <FormSection title="Services" invalid={hasErrorsUnder(["services"])}>
              <Repeater items={v.services} onChange={(next) => set(["services"], next)} max={9} itemLabel="Service" make={() => ({ title: "", description: "", items: [] })}>
                {(service, i) => (
                  <>
                    {text(["services", i, "title"], "Title")}
                    {text(["services", i, "description"], "Description", { optional: true, rows: 2 })}
                    <TagInput label="Key points" value={service.items} max={8} onChange={(items) => set(["services", i, "items"], items)} />
                  </>
                )}
              </Repeater>
            </FormSection>

            <FormSection title="Process" description="How a project runs, step by step." invalid={hasErrorsUnder(["process"])}>
              <Repeater items={v.process} onChange={(next) => set(["process"], next)} max={6} itemLabel="Step" make={() => ({ title: "", description: "", duration: "" })}>
                {(_, i) => (
                  <>
                    <div className="grid gap-4 md:grid-cols-[1fr_12rem]">
                      {text(["process", i, "title"], "Title")}
                      {text(["process", i, "duration"], "Timing", { optional: true })}
                    </div>
                    {text(["process", i, "description"], "Description", { optional: true, rows: 2 })}
                  </>
                )}
              </Repeater>
            </FormSection>

            <FormSection title="Ways to work together" description="Engagement models. Mark one as featured to highlight it." invalid={hasErrorsUnder(["engagements"])}>
              <Repeater
                items={v.engagements}
                onChange={(next) => set(["engagements"], next)}
                max={4}
                itemLabel="Engagement"
                make={() => ({ name: "", description: "", priceNote: "", includes: [], featured: false })}
              >
                {(engagement, i) => (
                  <>
                    <div className="grid gap-4 md:grid-cols-2">
                      {text(["engagements", i, "name"], "Name")}
                      {text(["engagements", i, "priceNote"], "Pricing note", { optional: true, hint: "e.g. “Fixed quote per project”." })}
                    </div>
                    {text(["engagements", i, "description"], "Description", { optional: true, rows: 2 })}
                    <StringList
                      label="Includes"
                      itemLabel="item"
                      max={10}
                      value={engagement.includes}
                      onChange={(items) => set(["engagements", i, "includes"], items)}
                      errorAt={(j) => error(["engagements", i, "includes", j])}
                    />
                    <Toggle label="Featured" checked={engagement.featured} onChange={(c) => set(["engagements", i, "featured"], c)} />
                  </>
                )}
              </Repeater>
            </FormSection>

            <FormSection title="Working together remotely" description="Time zones, communication, contracts and payments: what international clients want to know before they reach out." invalid={hasErrorsUnder(["remote"])}>
              <Repeater items={v.remote} onChange={(next) => set(["remote"], next)} max={6} itemLabel="Point" make={() => ({ title: "", description: "" })}>
                {(_, i) => (
                  <>
                    {text(["remote", i, "title"], "Title")}
                    {text(["remote", i, "description"], "Description", { optional: true, rows: 2 })}
                  </>
                )}
              </Repeater>
              <Toggle
                label="Show the comparison table"
                description="“Freelance marketplace vs agency vs working with me”. It describes how you work, so keep it only if every row is true for you."
                checked={v.showComparison}
                onChange={(c) => set(["showComparison"], c)}
              />
            </FormSection>

            <FormSection title="Client work" description="Projects shown on the studio. Leave empty to use featured projects." invalid={hasErrorsUnder(["workHeading"]) || hasErrorsUnder(["workIds"])}>
              {text(["workHeading"], "Section heading", { optional: true })}
              <ItemPicker options={projects} value={v.workIds} onChange={(ids) => set(["workIds"], ids)} />
            </FormSection>

            <FormSection title="FAQ" invalid={hasErrorsUnder(["faqs"])}>
              <Repeater items={v.faqs} onChange={(next) => set(["faqs"], next)} max={12} itemLabel="Question" make={() => ({ question: "", answer: "" })}>
                {(_, i) => (
                  <>
                    {text(["faqs", i, "question"], "Question")}
                    {text(["faqs", i, "answer"], "Answer", { rows: 3 })}
                  </>
                )}
              </Repeater>
            </FormSection>

            <FormSection title="Project inquiry form" description="Inquiries are saved under Messages, marked as studio inquiries." invalid={hasErrorsUnder(["inquiry"])}>
              {text(["inquiry", "intro"], "Intro text", { optional: true, rows: 2 })}
              {text(["inquiry", "responseNote"], "Note after sending", { optional: true, hint: "e.g. “I reply within one business day.” Only promise what you can keep." })}
              <TagInput label="Budget options" value={v.inquiry.budgets} max={8} onChange={(items) => set(["inquiry", "budgets"], items)} />
              <TagInput label="Timeline options" value={v.inquiry.timelines} max={8} onChange={(items) => set(["inquiry", "timelines"], items)} />
            </FormSection>

            <FormSection title="Contact & search engines" invalid={hasErrorsUnder(["contactEmail"])}>
              {text(["contactEmail"], "Studio email", { optional: true, hint: "Defaults to the email in Contact & social." })}
              <Toggle
                label="Let search engines index the studio"
                description="Off keeps the studio out of search results and the sitemap, so searching your name doesn't connect it to your portfolio."
                checked={v.indexable}
                onChange={(c) => set(["indexable"], c)}
              />
            </FormSection>
          </>
        );
      }}
    </SettingsForm>
  );
}
