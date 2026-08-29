import Link from "next/link";
import { submitVerifyEmail } from "@/lib/actions/auth";
import { PublicShell } from "@/components/layout/public-shell";
import { Card } from "@/components/ui/card";

export default async function VerifyEmailPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token = "" } = await searchParams;
  const result = await submitVerifyEmail(token);

  return (
    <PublicShell>
      <main className="px-5 py-16">
        <Card className="mx-auto w-full max-w-md p-6 shadow-soft">
          <h1 className="text-2xl font-bold text-charcoal">Email verification</h1>
          <p className={`mt-3 text-sm ${result.status === "error" ? "text-red-700" : "text-emerald-700"}`}>{result.message}</p>
          <Link href="/dashboard" className="mt-5 inline-block text-sm font-semibold text-rose-700 hover:text-rose-500">Go to dashboard</Link>
        </Card>
      </main>
    </PublicShell>
  );
}
