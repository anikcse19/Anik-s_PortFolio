"use client";

import { Field, FormSection, Input } from "@/components/admin/fields";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { SettingsForm } from "@/components/admin/settings-form";
import { ABOUT_SECTION_KEYS, ABOUT_SECTION_LABELS, type AboutSettings } from "@/lib/validation/settings";

const HINTS: Record<(typeof ABOUT_SECTION_KEYS)[number], string> = {
  introduction: "Shown large at the top, next to your portrait.",
  philosophy: "How you approach engineering work.",
  expertise: "What you are strongest at, in your own words.",
  learning: "What you are studying now. Be explicit that it is learning.",
  journey: "How your career developed.",
  systemDesign: "Your interest in system design and scalability.",
  approach: "How you build reliable business applications.",
  interests: "Optional professional interests and goals.",
};

export function AboutForm({ initial }: { initial: AboutSettings }) {
  return (
    <SettingsForm settingsKey="about" initial={initial} title="About page" description="Each section is optional and hidden when empty.">
      {({ value: v, set, error }) => (
        <>
          <FormSection title="Heading">
            <Field label="Page headline" optional error={error(["headline"])} hint="Defaults to “About {first name}”.">
              {({ id }) => <Input id={id} value={v.headline} onChange={(e) => set(["headline"], e.target.value)} />}
            </Field>
          </FormSection>
          {ABOUT_SECTION_KEYS.map((key) => (
            <FormSection key={key} title={ABOUT_SECTION_LABELS[key]}>
              <RichTextEditor label={ABOUT_SECTION_LABELS[key]} value={v.sections[key]} onChange={(html) => set(["sections", key], html)} hint={HINTS[key]} error={error(["sections", key])} />
            </FormSection>
          ))}
        </>
      )}
    </SettingsForm>
  );
}
