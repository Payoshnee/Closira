import Link from "next/link";
import { AuthForm } from "@/components/forms";
import { PublicShell } from "@/components/layout/public-shell";

export default function ForgotPasswordPage() {
  return (
    <PublicShell>
      <main className="px-5 py-16">
        <AuthForm
          title="Reset your password"
          description="Enter your email and Closira will prepare a secure password reset."
          cta="Request reset link"
          intent="forgot-password"
          includePassword={false}
          footer={
            <Link href="/login" className="font-semibold text-rose-700 hover:text-rose-500">
              Return to log in
            </Link>
          }
        />
      </main>
    </PublicShell>
  );
}
