"use client";

import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { discardHomepageDraftAction, publishHomepageAction, saveHomepageDraftAction } from "@/app/admin/_actions/settings";
import { ConfirmButton } from "@/components/admin/confirm-dialog";
import { resultToStatus, StatusMessage, type SaveStatus } from "@/components/admin/editor-shell";
import { Field, FieldGrid, FormSection, IconButton, Input, ListControls, moveItem, Notice, Select, TextArea, Toggle } from "@/components/admin/fields";
import { useForm } from "@/components/admin/use-form";
import { Button } from "@/components/ui/button";
import { HOME_SECTION_LABELS, type HomeConfig, type HomeSection } from "@/lib/validation/settings";

export type Option = { id: string; label: string; status: string; featured: boolean };
type Options = { projects: Option[]; caseStudies: Option[]; articles: Option[] };

const SECTION_HELP: Record<HomeSection["type"], string> = {
  intro: "A short introduction to the problems you work on. Separate paragraphs with a blank line; the first is set large.",
  projects: "Pick projects in order, or leave empty to use featured projects.",
  focus: "Shows published skill categories. Limit sets how many categories appear.",
  experience: "Shows the most recent published positions.",
  case_studies: "Pick case studies, or leave empty to use featured ones. Hidden if case studies are disabled.",
  writing: "Pick articles, or leave empty to use featured ones. Hidden if writing is disabled.",
  contact: "Closing call-to-action with your email, résumé and social links.",
};

export function HomepageEditor({ draft, hasUnpublished, publishedAt, options }: { draft: HomeConfig; hasUnpublished: boolean; publishedAt: string | null; options: Options }) {
  const router = useRouter();
  const form = useForm<HomeConfig>(draft);
  const { value: v, set, error } = form;
  const [status, setStatus] = useState<SaveStatus>({ kind: "idle" });
  const [unpublished, setUnpublished] = useState(hasUnpublished);

  async function run(kind: "draft" | "publish") {
    setStatus({ kind: "saving" });
    const res = kind === "draft" ? await saveHomepageDraftAction(form.value) : await publishHomepageAction(form.value);
    setStatus(resultToStatus(res));
    if (res.ok) {
      form.reset(form.value);
      setUnpublished(kind === "draft");
      router.refresh();
    } else {
      form.setErrors(res.fieldErrors ?? {});
    }
    return res.ok;
  }

  const sectionOptions = (type: HomeSection["type"]): Option[] =>
    type === "projects" ? options.projects : type === "case_studies" ? options.caseStudies : type === "writing" ? options.articles : [];

  return (
    <div>
      <div className="sticky top-0 z-20 -mx-4 border-b border-rule bg-paper/95 px-4 py-3 backdrop-blur-sm md:-mx-8 md:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-semibold">Homepage</h1>
            <p className="text-sm text-ink-3">
              {form.dirty ? "Unsaved edits · " : ""}
              {unpublished ? "Draft differs from the live homepage" : "Draft matches the live homepage"}
              {publishedAt ? ` · last published ${new Date(publishedAt).toLocaleString()}` : ""}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {unpublished && !form.dirty ? (
              <ConfirmButton
                title="Discard draft changes?"
                description="The draft will be reset to the live homepage configuration."
                confirmLabel="Discard"
                variant="ghost"
                onConfirm={async () => {
                  const res = await discardHomepageDraftAction();
                  setStatus(resultToStatus(res));
                  if (res.ok) {
                    router.refresh();
                    window.location.reload();
                  }
                }}
              >
                Discard draft
              </ConfirmButton>
            ) : null}
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                if (form.dirty && !(await run("draft"))) return;
                window.open("/admin/preview/home", "_blank", "noopener");
              }}
            >
              Preview draft
            </Button>
            <Button variant="secondary" size="sm" disabled={status.kind === "saving"} onClick={() => void run("draft")}>
              Save draft
            </Button>
            <Button size="sm" disabled={status.kind === "saving"} onClick={() => void run("publish")}>
              Publish
            </Button>
          </div>
        </div>
        <StatusMessage status={status} />
      </div>

      <div className="mt-6 max-w-4xl space-y-6">
        <FormSection title="Hero" description="Name, title and positioning come from Profile & hero.">
          <FieldGrid>
            <Field label="Layout">
              {({ id }) => (
                <Select id={id} value={v.hero.variant} onChange={(e) => set(["hero", "variant"], e.target.value)}>
                  <option value="split">Split — large name, statement and facts</option>
                  <option value="statement">Statement — positioning as the headline</option>
                </Select>
              )}
            </Field>
            <Field label="Eyebrow" optional hint="Small label above the hero (defaults to “Portfolio”).">
              {({ id }) => <Input id={id} value={v.hero.eyebrow} onChange={(e) => set(["hero", "eyebrow"], e.target.value)} />}
            </Field>
          </FieldGrid>
          <Field label="Statement override" optional hint="Leave empty to use the positioning statement from your profile." error={error(["hero", "statement"])}>
            {({ id }) => <TextArea id={id} rows={3} value={v.hero.statement} onChange={(e) => set(["hero", "statement"], e.target.value)} />}
          </Field>
          <Toggle label="Show quick facts" description="Role, location, focus areas and availability." checked={v.hero.showFacts} onChange={(c) => set(["hero", "showFacts"], c)} />
          <FieldGrid>
            <CtaFields label="Primary button" value={v.hero.primaryCta} onChange={(c) => set(["hero", "primaryCta"], c)} error={(k) => error(["hero", "primaryCta", k])} />
            <CtaFields label="Secondary button" value={v.hero.secondaryCta} onChange={(c) => set(["hero", "secondaryCta"], c)} error={(k) => error(["hero", "secondaryCta", k])} />
          </FieldGrid>
        </FormSection>

        <section aria-labelledby="sections-heading" className="space-y-3">
          <div>
            <h2 id="sections-heading" className="text-[0.9375rem] font-semibold">
              Sections
            </h2>
            <p className="text-sm text-ink-3">Order, visibility and copy. Sections with no published content are skipped automatically.</p>
          </div>
          {v.sections.map((section, i) => (
            <SectionCard
              key={section.type}
              section={section}
              index={i}
              count={v.sections.length}
              options={sectionOptions(section.type)}
              error={(path) => error(["sections", i, ...path])}
              onChange={(next) => set(["sections", i], next)}
              onMove={(from, to) => set(["sections"], moveItem(v.sections, from, to))}
            />
          ))}
        </section>
      </div>
    </div>
  );
}

function CtaFields({ label, value, onChange, error }: { label: string; value: { label: string; href: string }; onChange: (v: { label: string; href: string }) => void; error: (k: "label" | "href") => string | undefined }) {
  return (
    <fieldset className="space-y-2">
      <legend className="mb-1 text-sm font-medium">{label}</legend>
      <Input aria-label={`${label} text`} placeholder="Label" value={value.label} onChange={(e) => onChange({ ...value, label: e.target.value })} invalid={Boolean(error("label"))} />
      <Input aria-label={`${label} link`} placeholder="/projects" className="font-mono text-sm" value={value.href} onChange={(e) => onChange({ ...value, href: e.target.value })} invalid={Boolean(error("href"))} />
      {error("href") ? <p className="text-sm text-danger">{error("href")}</p> : null}
    </fieldset>
  );
}

function SectionCard({
  section,
  index,
  count,
  options,
  error,
  onChange,
  onMove,
}: {
  section: HomeSection;
  index: number;
  count: number;
  options: Option[];
  error: (path: (string | number)[]) => string | undefined;
  onChange: (s: HomeSection) => void;
  onMove: (from: number, to: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const patch = (p: Partial<HomeSection>) => onChange({ ...section, ...p });
  const selectable = options.length > 0 || ["projects", "case_studies", "writing"].includes(section.type);
  const hasError = Boolean(error([]) || error(["heading"]) || error(["cta", "href"]) || error(["intro"]));

  return (
    <div className={`border ${hasError ? "border-danger/60" : "border-rule"} ${section.enabled ? "" : "opacity-70"}`}>
      <div className="flex items-center gap-2 px-3 py-2">
        <span className="w-6 font-mono text-xs text-ink-3">{String(index + 1).padStart(2, "0")}</span>
        <button type="button" className="flex-1 text-left text-sm font-medium" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
          {HOME_SECTION_LABELS[section.type]}
          {section.heading ? <span className="ml-2 font-normal text-ink-3">“{section.heading}”</span> : null}
          {!section.enabled ? <span className="ml-2 text-xs font-normal text-ink-3">(hidden)</span> : null}
        </button>
        <IconButton label={section.enabled ? `Hide ${HOME_SECTION_LABELS[section.type]}` : `Show ${HOME_SECTION_LABELS[section.type]}`} onClick={() => patch({ enabled: !section.enabled })}>
          {section.enabled ? <Eye className="h-4 w-4" aria-hidden /> : <EyeOff className="h-4 w-4" aria-hidden />}
        </IconButton>
        <ListControls index={index} count={count} label={HOME_SECTION_LABELS[section.type]} onMove={onMove} />
      </div>
      {open ? (
        <div className="space-y-4 border-t border-rule p-4">
          <p className="text-sm text-ink-3">{SECTION_HELP[section.type]}</p>
          <FieldGrid>
            <Field label="Eyebrow" optional>
              {({ id }) => <Input id={id} value={section.eyebrow} onChange={(e) => patch({ eyebrow: e.target.value })} />}
            </Field>
            <Field label="Heading" optional error={error(["heading"])}>
              {({ id }) => <Input id={id} value={section.heading} onChange={(e) => patch({ heading: e.target.value })} />}
            </Field>
          </FieldGrid>
          <Field label={section.type === "intro" ? "Text" : "Intro"} optional error={error(["intro"])}>
            {({ id }) => <TextArea id={id} rows={section.type === "intro" ? 6 : 2} value={section.intro} onChange={(e) => patch({ intro: e.target.value })} />}
          </Field>
          {["projects", "experience", "case_studies", "writing", "focus"].includes(section.type) ? (
            <FieldGrid>
              <Field label="Maximum items">
                {({ id }) => <Input id={id} type="number" min={1} max={12} value={section.limit} onChange={(e) => patch({ limit: Number(e.target.value) })} />}
              </Field>
              {section.type === "projects" ? (
                <Field label="Layout">
                  {({ id }) => (
                    <Select id={id} value={section.layout} onChange={(e) => patch({ layout: e.target.value as HomeSection["layout"] })}>
                      <option value="ledger">Ledger with lead project</option>
                      <option value="grid">Image grid</option>
                    </Select>
                  )}
                </Field>
              ) : null}
            </FieldGrid>
          ) : null}
          {selectable && ["projects", "case_studies", "writing"].includes(section.type) ? (
            <ItemPicker options={options} value={section.itemIds} onChange={(ids) => patch({ itemIds: ids })} />
          ) : null}
          <FieldGrid>
            <Field label="Link label" optional>
              {({ id }) => <Input id={id} value={section.cta.label} onChange={(e) => patch({ cta: { ...section.cta, label: e.target.value } })} />}
            </Field>
            <Field label="Link destination" optional error={error(["cta", "href"])}>
              {({ id, invalid }) => <Input id={id} invalid={invalid} className="font-mono text-sm" value={section.cta.href} onChange={(e) => patch({ cta: { ...section.cta, href: e.target.value } })} />}
            </Field>
          </FieldGrid>
        </div>
      ) : null}
    </div>
  );
}

export function ItemPicker({ options, value, onChange }: { options: Option[]; value: string[]; onChange: (ids: string[]) => void }) {
  const byId = new Map(options.map((o) => [o.id, o]));
  const available = options.filter((o) => !value.includes(o.id));
  return (
    <fieldset className="space-y-2">
      <legend className="mb-1 text-sm font-medium">Selected items</legend>
      {value.length === 0 ? <Notice>Nothing selected — featured items are used (or the first published items if none are featured).</Notice> : null}
      <ol className="space-y-1">
        {value.map((id, i) => {
          const o = byId.get(id);
          return (
            <li key={id} className="flex items-center gap-2 border border-rule px-2 py-1 text-sm">
              <span className="flex-1">
                {o?.label ?? "Missing item"}
                {o && o.status !== "published" ? <span className="ml-2 text-xs text-warning">draft — not shown publicly</span> : null}
              </span>
              <ListControls index={i} count={value.length} label={o?.label ?? "item"} onMove={(f, t) => onChange(moveItem(value, f, t))} onRemove={(idx) => onChange(value.filter((_, j) => j !== idx))} />
            </li>
          );
        })}
      </ol>
      {available.length ? (
        <Select
          aria-label="Add item"
          value=""
          onChange={(e) => {
            if (e.target.value) onChange([...value, e.target.value].slice(0, 12));
          }}
        >
          <option value="">+ Add an item…</option>
          {available.map((o) => (
            <option key={o.id} value={o.id}>
              {o.label}
              {o.status !== "published" ? " (draft)" : ""}
              {o.featured ? " ★" : ""}
            </option>
          ))}
        </Select>
      ) : null}
    </fieldset>
  );
}
