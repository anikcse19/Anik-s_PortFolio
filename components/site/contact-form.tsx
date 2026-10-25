"use client";

import { useActionState, useEffect, useRef } from "react";
import { submitContact } from "@/app/(site)/contact/actions";
import { Button } from "@/components/ui/button";
import type { ContactFormState } from "@/lib/contact";
import { cn } from "@/lib/utils";

const initialState: ContactFormState = { status: "idle" };

export function ContactForm({ responseNote }: { responseNote?: string }) {
  const [state, formAction, pending] = useActionState(submitContact, initialState);
  const startedAtRef = useRef<HTMLInputElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") formRef.current?.reset();
    if (state.status !== "idle") statusRef.current?.focus();
  }, [state]);

  const errors = state.status === "error" ? (state.fieldErrors ?? {}) : {};
  const values = state.status === "error" ? (state.values ?? {}) : {};

  if (state.status === "success") {
    return (
      <div ref={statusRef} tabIndex={-1} role="status" className="rounded-xl border border-rule bg-surface p-6 outline-none">
        <p className="text-sm font-medium text-success">Message received</p>
        <p className="mt-3 text-lead text-ink">{state.message}</p>
        {responseNote ? <p className="mt-2 text-ink-2">{responseNote}</p> : null}
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      action={formAction}
      noValidate
      // Records when the visitor started filling the form (a spam signal checked on the server).
      onFocusCapture={() => {
        if (startedAtRef.current && !startedAtRef.current.value) startedAtRef.current.value = String(Date.now());
      }} className="space-y-6" aria-describedby={state.status === "error" ? "contact-status" : undefined}>
      {state.status === "error" ? (
        <div ref={statusRef} id="contact-status" tabIndex={-1} role="alert" className="rounded-lg border border-danger/50 bg-danger/5 px-4 py-3 text-[0.9375rem] text-ink outline-none">
          {state.message}
        </div>
      ) : null}

      <div className="grid gap-6 sm:grid-cols-2">
        <Field id="name" label="Name" error={errors.name}>
          <input id="name" name="name" type="text" autoComplete="name" required maxLength={120} defaultValue={values.name} {...describe("name", errors.name)} className={inputClass(errors.name)} />
        </Field>
        <Field id="email" label="Email" error={errors.email}>
          <input id="email" name="email" type="email" autoComplete="email" required maxLength={254} defaultValue={values.email} {...describe("email", errors.email)} className={inputClass(errors.email)} />
        </Field>
      </div>
      <Field id="subject" label="Subject" optional error={errors.subject}>
        <input id="subject" name="subject" type="text" maxLength={160} defaultValue={values.subject} {...describe("subject", errors.subject)} className={inputClass(errors.subject)} />
      </Field>
      <Field id="message" label="Message" error={errors.message} hint="What are you building, and how can I help?">
        <textarea id="message" name="message" required minLength={10} maxLength={5000} rows={7} defaultValue={values.message} {...describe("message", errors.message, true)} className={cn(inputClass(errors.message), "h-auto py-3 leading-relaxed")} />
      </Field>

      {/* Spam trap: hidden from people and assistive technology, often filled by bots. */}
      <div aria-hidden="true" className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>
      <input ref={startedAtRef} type="hidden" name="startedAt" defaultValue="" />

      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" disabled={pending} aria-disabled={pending}>
          {pending ? "Sending…" : "Send message"}
        </Button>
        <p className="text-sm text-ink-3">Your details are only used to reply to you.</p>
      </div>
    </form>
  );
}

export function describe(id: string, error?: string, hasHint = false) {
  const ids = [hasHint ? `${id}-hint` : "", error ? `${id}-error` : ""].filter(Boolean).join(" ");
  return { "aria-invalid": error ? true : undefined, "aria-describedby": ids || undefined } as const;
}

export function inputClass(error?: string) {
  return cn(
    "h-11 w-full rounded-lg border bg-paper px-3 text-ink placeholder:text-ink-3 focus:outline-none",
    error ? "border-danger focus:border-danger" : "border-rule-strong focus:border-ink",
  );
}

export function Field({ id, label, optional, hint, error, children }: { id: string; label: string; optional?: boolean; hint?: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 flex items-baseline justify-between text-sm font-medium text-ink">
        {label}
        {optional ? <span className="font-normal text-ink-3">Optional</span> : null}
      </label>
      {hint ? (
        <p id={`${id}-hint`} className="-mt-1 mb-2 text-sm text-ink-3">
          {hint}
        </p>
      ) : null}
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-2 text-sm text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
