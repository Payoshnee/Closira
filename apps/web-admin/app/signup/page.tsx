import Link from "next/link";
import { PublicShell } from "@/components/layout/public-shell";
import { AuthCard } from "@/components/marketing/auth-card";

export default function SignupPage() {
  return (
    <PublicShell>
      <main className="px-5 py-16">
        <AuthCard
          title="Start organizing your wardrobe"
          description="Join early access and be ready for the full wardrobe dashboard in the next implementation run."
          cta="Request early access"
          includeName
          footer={
            <>
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-rose-700 hover:text-rose-500">
                Log in
              </Link>
            </>
          }
        />
      </main>
    </PublicShell>
  );
}

