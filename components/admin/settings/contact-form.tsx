"use client";

import { AddButton, Field, FormSection, Input, ListControls, moveItem, Notice, Select, TextArea, Toggle } from "@/components/admin/fields";
import { SettingsForm } from "@/components/admin/settings-form";
import { SOCIAL_KINDS, type ContactSettings } from "@/lib/validation/settings";

export function ContactSettingsForm({ initial, mailConfigured }: { initial: ContactSettings; mailConfigured: boolean }) {
  return (
    <SettingsForm settingsKey="contact" initial={initial} title="Contact & social" description="Public contact details and the contact form.">
      {({ value: v, set, error }) => (
        <>
          <FormSection title="Email">
            <Field label="Public contact email" optional error={error(["email"])} hint="Shown on the site. Leave empty to hide (the form still works).">
              {({ id, invalid }) => <Input id={id} type="email" invalid={invalid} value={v.email} onChange={(e) => set(["email"], e.target.value)} />}
            </Field>
          </FormSection>
          <FormSection title="Contact form">
            <Toggle label="Enable the contact form" checked={v.formEnabled} onChange={(c) => set(["formEnabled"], c)} />
            {mailConfigured ? (
              <Notice tone="success">Email notifications are configured. Every message is also saved under Messages.</Notice>
            ) : (
              <Notice tone="warning">
                SMTP is not configured, so messages are saved under Messages but no notification email is sent. Set SMTP_HOST, SMTP_USER, SMTP_PASS and CONTACT_TO_EMAIL to enable notifications.
              </Notice>
            )}
            <Field label="Intro text" optional error={error(["formIntro"])}>
              {({ id }) => <TextArea id={id} rows={2} value={v.formIntro} onChange={(e) => set(["formIntro"], e.target.value)} />}
            </Field>
            <Field label="Note after sending" optional error={error(["responseNote"])} hint="e.g. when people can expect a reply. Only add what you can commit to.">
              {({ id }) => <Input id={id} value={v.responseNote} onChange={(e) => set(["responseNote"], e.target.value)} />}
            </Field>
          </FormSection>
          <FormSection title="Social links" invalid={hasSocialErrors(error, "socials", v.socials.length)}>
            <ol className="space-y-3">
              {v.socials.map((s, i) => (
                <li key={i} className="grid gap-2 border-b border-rule pb-3 md:grid-cols-[9rem_10rem_minmax(0,1fr)_auto] md:items-start">
                  <Select aria-label={`Link ${i + 1} type`} value={s.kind} onChange={(e) => set(["socials", i, "kind"], e.target.value)}>
                    {SOCIAL_KINDS.map((k) => (
                      <option key={k} value={k}>
                        {k}
                      </option>
                    ))}
                  </Select>
                  <div>
                    <Input aria-label={`Link ${i + 1} label`} placeholder="Label" invalid={Boolean(error(["socials", i, "label"]))} value={s.label} onChange={(e) => set(["socials", i, "label"], e.target.value)} />
                    {error(["socials", i, "label"]) ? <p className="mt-1 text-sm text-danger">{error(["socials", i, "label"])}</p> : null}
                  </div>
                  <div>
                    <Input aria-label={`Link ${i + 1} URL`} type="url" placeholder="https://" invalid={Boolean(error(["socials", i, "url"]))} value={s.url} onChange={(e) => set(["socials", i, "url"], e.target.value)} />
                    {error(["socials", i, "url"]) ? <p className="mt-1 text-sm text-danger">{error(["socials", i, "url"])}</p> : null}
                  </div>
                  <ListControls index={i} count={v.socials.length} label={`link ${s.label || i + 1}`} onMove={(f, t) => set(["socials"], moveItem(v.socials, f, t))} onRemove={(idx) => set(["socials"], v.socials.filter((_, j) => j !== idx))} />
                </li>
              ))}
            </ol>
            <AddButton onClick={() => set(["socials"], [...v.socials, { kind: "other", label: "", url: "" }])} disabled={v.socials.length >= 12}>
              Add link
            </AddButton>
          </FormSection>
        </>
      )}
    </SettingsForm>
  );
}

function hasSocialErrors(error: (p: (string | number)[]) => string | undefined, key: string, count: number) {
  for (let i = 0; i < count; i++) if (error([key, i, "label"]) || error([key, i, "url"])) return true;
  return false;
}
