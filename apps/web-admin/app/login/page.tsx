import Link from "next/link";
import { AuthForm } from "@/components/forms";
import { PublicShell } from "@/components/layout/public-shell";

export default function LoginPage() {
  return (
    <PublicShell>
      <main className="px-5 py-16">
        <AuthForm
          title="Log in to Clorisa"
          description="Access your private wardrobe dashboard with a secure Clorisa session."
          cta="Log in"
          intent="login"
          footer={
            <>
              New to Clorisa?{" "}
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
