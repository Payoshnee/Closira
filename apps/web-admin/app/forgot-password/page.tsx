import Link from "next/link";
import { PublicShell } from "@/components/layout/public-shell";
import { AuthCard } from "@/components/marketing/auth-card";

export default function ForgotPasswordPage() {
  return (
    <PublicShell>
      <main className="px-5 py-16">
        <AuthCard
          title="Reset your password"
          description="Enter your email and the auth service will send reset instructions once Run 2 integration is active."
          cta="Request reset link"
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

