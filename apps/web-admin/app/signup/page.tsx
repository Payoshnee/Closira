import Link from "next/link";
import { AuthForm } from "@/components/forms";
import { PublicShell } from "@/components/layout/public-shell";

export default function SignupPage() {
  return (
    <PublicShell>
      <main className="px-5 py-16">
        <AuthForm
          title="Start organizing your wardrobe"
          description="Create your Closira account and start building a wardrobe that syncs to the API."
          cta="Create account"
          intent="signup"
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
