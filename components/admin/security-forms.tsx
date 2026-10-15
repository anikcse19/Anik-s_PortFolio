"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { changePasswordAction, signOutOtherSessionsAction, updateAccountAction } from "@/app/admin/_actions/account";
import { Button } from "@/components/ui/button";
import { resultToStatus, StatusMessage, type SaveStatus } from "./editor-shell";
import { Field, FormSection, Input } from "./fields";

export function AccountForm({ name, email }: { name: string; email: string }) {
  const router = useRouter();
  const [v, setV] = useState({ name, email, currentPassword: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<SaveStatus>({ kind: "idle" });
  const emailChanged = v.email.trim().toLowerCase() !== email;

  return (
    <FormSection title="Account">
      <form
        className="space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          setStatus({ kind: "saving" });
          const res = await updateAccountAction(v);
          setStatus(resultToStatus(res));
          setErrors(res.ok ? {} : (res.fieldErrors ?? {}));
          if (res.ok) {
            setV({ ...v, currentPassword: "" });
            router.refresh();
          }
        }}
      >
        <Field label="Display name" optional>
          {({ id }) => <Input id={id} autoComplete="name" value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} />}
        </Field>
        <Field label="Sign-in email" error={errors.email}>
          {({ id, invalid }) => <Input id={id} type="email" autoComplete="username" invalid={invalid} value={v.email} onChange={(e) => setV({ ...v, email: e.target.value })} />}
        </Field>
        {emailChanged ? (
          <Field label="Current password" error={errors.currentPassword} hint="Required to change your sign-in email.">
            {({ id, invalid }) => <Input id={id} type="password" autoComplete="current-password" invalid={invalid} value={v.currentPassword} onChange={(e) => setV({ ...v, currentPassword: e.target.value })} />}
          </Field>
        ) : null}
        <div className="flex items-center gap-3">
          <Button type="submit" size="sm" disabled={status.kind === "saving"}>
            Save account
          </Button>
          <StatusMessage status={status} />
        </div>
      </form>
    </FormSection>
  );
}

export function PasswordForm() {
  const [v, setV] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<SaveStatus>({ kind: "idle" });

  return (
    <FormSection title="Change password" description="At least 12 characters. A long passphrase is best. Changing it signs out every other device.">
      <form
        className="space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          setStatus({ kind: "saving" });
          const res = await changePasswordAction(v);
          setStatus(resultToStatus(res));
          setErrors(res.ok ? {} : (res.fieldErrors ?? {}));
          if (res.ok) setV({ currentPassword: "", newPassword: "", confirmPassword: "" });
        }}
      >
        <Field label="Current password" error={errors.currentPassword}>
          {({ id, invalid }) => <Input id={id} type="password" autoComplete="current-password" invalid={invalid} value={v.currentPassword} onChange={(e) => setV({ ...v, currentPassword: e.target.value })} />}
        </Field>
        <Field label="New password" error={errors.newPassword}>
          {({ id, invalid }) => <Input id={id} type="password" autoComplete="new-password" invalid={invalid} value={v.newPassword} onChange={(e) => setV({ ...v, newPassword: e.target.value })} />}
        </Field>
        <Field label="Confirm new password" error={errors.confirmPassword}>
          {({ id, invalid }) => <Input id={id} type="password" autoComplete="new-password" invalid={invalid} value={v.confirmPassword} onChange={(e) => setV({ ...v, confirmPassword: e.target.value })} />}
        </Field>
        <div className="flex items-center gap-3">
          <Button type="submit" size="sm" disabled={status.kind === "saving"}>
            Change password
          </Button>
          <StatusMessage status={status} />
        </div>
      </form>
    </FormSection>
  );
}

export function SessionsPanel({ count }: { count: number }) {
  const router = useRouter();
  const [status, setStatus] = useState<SaveStatus>({ kind: "idle" });
  return (
    <FormSection title="Sessions" description="Sessions expire after 7 days, or after 24 hours of inactivity.">
      <p className="text-sm text-ink-2">
        {count} active session{count === 1 ? "" : "s"} (including this one).
      </p>
      <div className="flex items-center gap-3">
        <Button
          variant="secondary"
          size="sm"
          disabled={count <= 1 || status.kind === "saving"}
          onClick={async () => {
            setStatus({ kind: "saving" });
            const res = await signOutOtherSessionsAction();
            setStatus(resultToStatus(res));
            router.refresh();
          }}
        >
          Sign out other sessions
        </Button>
        <StatusMessage status={status} />
      </div>
    </FormSection>
  );
}
