"use client";

import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { saveSettingsAction } from "@/app/admin/_actions/settings";
import { Button } from "@/components/ui/button";
import type { SettingsKey } from "@/lib/validation/settings";
import { StatusMessage, type SaveStatus } from "./editor-shell";
import { useForm, type FormApi } from "./use-form";

/** Shared wrapper for single-document settings pages (profile, SEO, appearance, ...). */
export function SettingsForm<T>({
  settingsKey,
  initial,
  title,
  description,
  children,
}: {
  settingsKey: Exclude<SettingsKey, "homepage">;
  initial: T;
  title: string;
  description?: ReactNode;
  children: (form: FormApi<T>) => ReactNode;
}) {
  const router = useRouter();
  const form = useForm<T>(initial);
  const [status, setStatus] = useState<SaveStatus>({ kind: "idle" });

  async function submit() {
    setStatus({ kind: "saving" });
    const res = await saveSettingsAction(settingsKey, form.value);
    if (res.ok) {
      form.reset(form.value);
      setStatus({ kind: "success", message: res.message ?? "Saved" });
      router.refresh();
    } else {
      form.setErrors(res.fieldErrors ?? {});
      setStatus({ kind: "error", message: res.error, unauthorized: res.code === "UNAUTHORIZED" });
    }
  }

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
    >
      <div className="sticky top-0 z-20 -mx-4 border-b border-rule bg-paper/95 px-4 py-3 backdrop-blur-sm md:-mx-8 md:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-semibold">{title}</h1>
            {description ? <p className="text-sm text-ink-3">{description}</p> : null}
          </div>
          <div className="flex items-center gap-3">
            {form.dirty ? <span className="text-xs text-warning">Unsaved changes</span> : null}
            <Button type="submit" size="sm" disabled={status.kind === "saving"}>
              Save changes
            </Button>
          </div>
        </div>
        <StatusMessage status={status} />
      </div>
      <div className="mt-6 max-w-4xl space-y-6">{children(form)}</div>
    </form>
  );
}
