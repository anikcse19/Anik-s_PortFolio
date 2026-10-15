import { Notice } from "@/components/admin/fields";
import { PageHeader } from "@/components/admin/list-page";
import { AccountForm, PasswordForm, SessionsPanel } from "@/components/admin/security-forms";
import { requireAdmin } from "@/lib/auth/session";
import { connectDB } from "@/lib/db";
import { SessionModel } from "@/lib/models";

export const metadata = { title: "Security" };

export default async function SecurityPage() {
  const admin = await requireAdmin();
  await connectDB();
  const sessions = await SessionModel.countDocuments({ adminId: admin.id, expiresAt: { $gt: new Date() } });
  return (
    <>
      <PageHeader title="Account & security" />
      <div className="mt-6 max-w-2xl space-y-6">
        <AccountForm name={admin.name} email={admin.email} />
        <PasswordForm />
        <SessionsPanel count={sessions} />
        <Notice>
          There is no email-based password reset. If you lose access, run <code className="font-mono">npm run admin:create</code> with database access to reset the password (see the README).
        </Notice>
      </div>
    </>
  );
}
