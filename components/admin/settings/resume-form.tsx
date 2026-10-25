"use client";

import { ExternalLink } from "lucide-react";
import { Field, FieldGrid, FormSection, Input, Notice, Select, StringList, TextArea, Toggle } from "@/components/admin/fields";
import { Repeater } from "@/components/admin/repeater";
import { SettingsForm } from "@/components/admin/settings-form";
import { ItemPicker, type Option } from "@/components/admin/settings/homepage-editor";
import { RESUME_PATH } from "@/lib/resume";
import type { ResumeSettings } from "@/lib/validation/settings";

type ExperienceOption = { id: string; label: string; status: string };

export function ResumeForm({ initial, experience, projects, externalUrl }: { initial: ResumeSettings; experience: ExperienceOption[]; projects: Option[]; externalUrl: string }) {
  return (
    <SettingsForm
      settingsKey="resume"
      initial={initial}
      title="Résumé"
      description="A PDF generated from your published experience, projects and skills. Update the content once and the résumé follows."
    >
      {({ value: v, set, error, hasErrorsUnder }) => (
        <>
          <FormSection
            title="Use on the site"
            aside={
              <a href={RESUME_PATH} target="_blank" rel="noopener" className="inline-flex h-8 items-center gap-1.5 rounded-md border border-rule-strong px-3 text-sm text-ink hover:bg-surface">
                Open PDF <ExternalLink aria-hidden className="h-3.5 w-3.5" />
              </a>
            }
          >
            <Toggle
              label="Use the generated résumé"
              description={`Every “Résumé” link on the portfolio points to ${RESUME_PATH}. When off, links use the Résumé URL from Profile${externalUrl ? "" : " (currently empty, so résumé links are hidden)"}.`}
              checked={v.useGenerated}
              onChange={(c) => set(["useGenerated"], c)}
            />
            <Notice>Save your changes, then open the PDF to see them. Publishing or editing a project, role or skill updates the résumé automatically.</Notice>
          </FormSection>

          <FormSection title="Header" invalid={["headline", "summary", "phone"].some((k) => hasErrorsUnder([k]))}>
            <FieldGrid>
              <Field label="Headline" optional error={error(["headline"])} hint="Defaults to your professional title.">
                {({ id, invalid }) => <Input id={id} invalid={invalid} value={v.headline} onChange={(e) => set(["headline"], e.target.value)} />}
              </Field>
              <Field label="Paper size" hint="Letter for US employers, A4 for most others.">
                {({ id }) => (
                  <Select id={id} value={v.paperSize} onChange={(e) => set(["paperSize"], e.target.value)}>
                    <option value="A4">A4</option>
                    <option value="LETTER">US Letter</option>
                  </Select>
                )}
              </Field>
            </FieldGrid>
            <Field label="Summary" optional error={error(["summary"])} hint="Two or three sentences. Defaults to your positioning statement from Profile.">
              {({ id, invalid }) => <TextArea id={id} rows={3} invalid={invalid} value={v.summary} onChange={(e) => set(["summary"], e.target.value)} />}
            </Field>
            <Field label="Phone" optional error={error(["phone"])} hint="Only shown on the résumé. Include the country code, e.g. +880 …">
              {({ id, invalid }) => <Input id={id} type="tel" invalid={invalid} value={v.phone} onChange={(e) => set(["phone"], e.target.value)} />}
            </Field>
          </FormSection>

          <FormSection title="Experience" description="Published roles appear in the same order as on the site. Their achievements become the bullet points (the summary is used when a role has none).">
            {experience.length ? (
              <ul className="space-y-1">
                {experience.map((e) => (
                  <li key={e.id}>
                    <Toggle
                      label={e.label}
                      description={e.status !== "published" ? "Draft: not shown anywhere until published" : undefined}
                      checked={!v.excludedExperienceIds.includes(e.id)}
                      onChange={(include) =>
                        set(["excludedExperienceIds"], include ? v.excludedExperienceIds.filter((x) => x !== e.id) : [...v.excludedExperienceIds, e.id])
                      }
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <Notice>No experience entries yet.</Notice>
            )}
          </FormSection>

          <FormSection title="Projects" description="Each project shows its summary, impact numbers, verified outcomes and stack." invalid={hasErrorsUnder(["projectIds"]) || hasErrorsUnder(["projectLimit"])}>
            <Field label="Maximum projects" error={error(["projectLimit"])} hint="0 hides the section. Three or four keeps a senior résumé to two pages.">
              {({ id, invalid }) => <Input id={id} type="number" min={0} max={8} invalid={invalid} value={v.projectLimit} onChange={(e) => set(["projectLimit"], e.target.value)} className="max-w-[8rem]" />}
            </Field>
            <ItemPicker options={projects} value={v.projectIds} onChange={(ids) => set(["projectIds"], ids)} />
          </FormSection>

          <FormSection title="Skills">
            <Toggle label="Include skills" description="Uses your skill categories. “Currently learning” skills follow the setting in Appearance." checked={v.showSkills} onChange={(c) => set(["showSkills"], c)} />
          </FormSection>

          <FormSection title="Education" description="Not shown on the site, only on the résumé." invalid={hasErrorsUnder(["education"])}>
            <Repeater items={v.education} onChange={(next) => set(["education"], next)} max={4} itemLabel="Entry" make={() => ({ institution: "", degree: "", period: "", details: "" })}>
              {(entry, i) => (
                <>
                  <FieldGrid>
                    <Field label="Institution" error={error(["education", i, "institution"])}>
                      {({ id, invalid }) => <Input id={id} invalid={invalid} value={entry.institution} onChange={(e) => set(["education", i, "institution"], e.target.value)} />}
                    </Field>
                    <Field label="Degree" optional error={error(["education", i, "degree"])}>
                      {({ id, invalid }) => <Input id={id} invalid={invalid} value={entry.degree} onChange={(e) => set(["education", i, "degree"], e.target.value)} placeholder="B.Sc. in Computer Science and Engineering" />}
                    </Field>
                  </FieldGrid>
                  <FieldGrid>
                    <Field label="Period" optional error={error(["education", i, "period"])}>
                      {({ id, invalid }) => <Input id={id} invalid={invalid} value={entry.period} onChange={(e) => set(["education", i, "period"], e.target.value)} placeholder="2016 – 2020" />}
                    </Field>
                    <Field label="Details" optional error={error(["education", i, "details"])}>
                      {({ id, invalid }) => <Input id={id} invalid={invalid} value={entry.details} onChange={(e) => set(["education", i, "details"], e.target.value)} />}
                    </Field>
                  </FieldGrid>
                </>
              )}
            </Repeater>
          </FormSection>

          <FormSection title="Additional" description="Short extra lines such as languages, certifications or awards." invalid={hasErrorsUnder(["additional"])}>
            <StringList label="Lines" itemLabel="line" max={8} value={v.additional} onChange={(x) => set(["additional"], x)} errorAt={(i) => error(["additional", i])} hint="e.g. “Languages: English (professional), Bengali (native)”." />
          </FormSection>
        </>
      )}
    </SettingsForm>
  );
}
