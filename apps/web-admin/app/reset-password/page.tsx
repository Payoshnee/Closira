import { ResetPasswordForm } from "@/components/forms/reset-password-form";
import { PublicShell } from "@/components/layout/public-shell";

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token = "" } = await searchParams;

  return (
    <PublicShell>
      <main className="px-5 py-16">
        <ResetPasswordForm token={token} />
      </main>
    </PublicShell>
  );
}
