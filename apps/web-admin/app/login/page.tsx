import Link from "next/link";
import { PublicShell } from "@/components/layout/public-shell";
import { AuthCard } from "@/components/marketing/auth-card";

export default function LoginPage() {
  return (
    <PublicShell>
      <main className="px-5 py-16">
        <AuthCard
          title="Log in to Closira"
          description="Dashboard access arrives in Run 2. This entry screen is ready for the real auth service."
          cta="Log in"
          footer={
            <>
              New to Closira?{" "}
              <Link href="/signup" className="font-semibold text-rose-700 hover:text-rose-500">
                Create an account
              </Link>
            </>
          }
        />
      </main>
    </PublicShell>
  );
}

