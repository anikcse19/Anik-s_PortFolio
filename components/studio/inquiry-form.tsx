"use client";

import { CheckCircle2 } from "lucide-react";
import { useActionState, useEffect, useRef } from "react";
import { submitStudioInquiry } from "@/app/studio/start/actions";
import { describe, Field, inputClass } from "@/components/site/contact-form";
import { Button } from "@/components/ui/button";
import type { ContactFormState } from "@/lib/contact";
import { cn } from "@/lib/utils";

const initialState: ContactFormState = { status: "idle" };

export function InquiryForm({ services, budgets, timelines, responseNote }: { services: string[]; budgets: string[]; timelines: string[]; responseNote?: string }) {
  const [state, formAction, pending] = useActionState(submitStudioInquiry, initialState);
  const startedAtRef = useRef<HTMLInputElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (state.status !== "idle") statusRef.current?.focus();
  }, [state]);

  const errors = state.status === "error" ? (state.fieldErrors ?? {}) : {};
  const values = state.status === "error" ? (state.values ?? {}) : {};

  if (state.status === "success") {
    return (
      <div ref={statusRef} tabIndex={-1} role="status" className="py-6 text-center outline-none">
        <CheckCircle2 aria-hidden className="mx-auto h-10 w-10 text-success" />
        <p className="mt-4 text-title-3 font-semibold text-ink">{state.message}</p>
        <p className="mx-auto mt-2 max-w-md text-ink-2">{responseNote || "I'll review the details and reply by email with next steps."}</p>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      noValidate
      // Records when the visitor started filling the form (a spam signal checked on the server).
      onFocusCapture={() => {
        if (startedAtRef.current && !startedAtRef.current.value) startedAtRef.current.value = String(Date.now());
      }}
      className="space-y-6"
      aria-describedby={state.status === "error" ? "inquiry-status" : undefined}
    >
      {state.status === "error" ? (
        <div ref={statusRef} id="inquiry-status" tabIndex={-1} role="alert" className="rounded-lg border border-danger/50 bg-danger/5 px-4 py-3 text-[0.9375rem] text-ink outline-none">
          {state.message}
        </div>
      ) : null}

      <div className="grid gap-6 sm:grid-cols-2">
        <Field id="name" label="Your name" error={errors.name}>
          <input id="name" name="name" type="text" autoComplete="name" required maxLength={120} defaultValue={values.name} {...describe("name", errors.name)} className={inputClass(errors.name)} />
        </Field>
        <Field id="email" label="Work email" error={errors.email}>
          <input id="email" name="email" type="email" autoComplete="email" required maxLength={254} defaultValue={values.email} {...describe("email", errors.email)} className={inputClass(errors.email)} />
        </Field>
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        <Field id="company" label="Company" optional error={errors.company}>
          <input id="company" name="company" type="text" autoComplete="organization" maxLength={120} defaultValue={values.company} {...describe("company", errors.company)} className={inputClass(errors.company)} />
        </Field>
        <Field id="service" label="What do you need?" optional error={errors.service}>
          <Select id="service" name="service" options={[...services, "Something else"]} defaultValue={values.service} error={errors.service} />
        </Field>
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        <Field id="budget" label="Budget" optional error={errors.budget}>
          <Select id="budget" name="budget" options={budgets} defaultValue={values.budget} error={errors.budget} />
        </Field>
        <Field id="timeline" label="Timeline" optional error={errors.timeline}>
          <Select id="timeline" name="timeline" options={timelines} defaultValue={values.timeline} error={errors.timeline} />
        </Field>
      </div>
      <Field id="message" label="About your project" error={errors.message} hint="What are you building, who is it for, and what does success look like?">
        <textarea id="message" name="message" required minLength={10} maxLength={5000} rows={6} defaultValue={values.message} {...describe("message", errors.message, true)} className={cn(inputClass(errors.message), "h-auto py-3 leading-relaxed")} />
      </Field>

      {/* Spam trap: hidden from people and assistive technology, often filled by bots. */}
      <div aria-hidden="true" className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>
      <input ref={startedAtRef} type="hidden" name="startedAt" defaultValue="" />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button type="submit" className="h-12 px-6" disabled={pending} aria-disabled={pending}>
          {pending ? "Sending…" : "Send inquiry"}
        </Button>
        <p className="text-sm text-ink-3">No obligation. Your details are only used to reply to you.</p>
      </div>
    </form>
  );
}

function Select({ id, name, options, defaultValue, error }: { id: string; name: string; options: string[]; defaultValue?: string; error?: string }) {
  return (
    <select id={id} name={name} defaultValue={defaultValue ?? ""} {...describe(id, error)} className={inputClass(error)}>
      <option value="">Select…</option>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}
