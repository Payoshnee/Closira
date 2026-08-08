import Link from "next/link";
import { AuthForm } from "@/components/forms";
import { PublicShell } from "@/components/layout/public-shell";

export default function ForgotPasswordPage() {
  return (
    <PublicShell>
      <main className="px-5 py-16">
        <AuthForm
          title="Reset your password"
          description="Enter your email. Password reset API wiring will connect to the backend auth service once available."
          cta="Request reset link"
          action="/login"
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
