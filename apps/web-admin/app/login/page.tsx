import Link from "next/link";
import { AuthForm } from "@/components/forms";
import { PublicShell } from "@/components/layout/public-shell";

export default function LoginPage() {
  return (
    <PublicShell>
      <main className="px-5 py-16">
        <AuthForm
          title="Log in to Closira"
          description="Access the private wardrobe dashboard. Real token persistence will connect to the NestJS auth API when those endpoints are implemented."
          cta="Log in"
          action="/dashboard"
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
