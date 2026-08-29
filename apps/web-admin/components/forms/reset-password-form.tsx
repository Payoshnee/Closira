"use client";

import Link from "next/link";
import { useActionState } from "react";
import { submitResetPassword } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(submitResetPassword, {
    status: "ready" as const,
    message: ""
  });

  return (
    <Card className="mx-auto w-full max-w-md p-6 shadow-soft">
      <h1 className="text-2xl font-bold text-charcoal">Choose a new password</h1>
      <form className="mt-6 space-y-4" action={action}>
        <input type="hidden" name="token" value={token} />
        <label className="block text-sm font-medium text-charcoal">
          New password
          <Input className="mt-2" name="password" type="password" minLength={8} autoComplete="new-password" required />
        </label>
        <Button className="w-full" type="submit" disabled={pending}>{pending ? "Saving..." : "Reset password"}</Button>
      </form>
      {state.message ? (
        <p className={`mt-4 text-sm ${state.status === "error" ? "text-red-700" : "text-emerald-700"}`} role="status">{state.message}</p>
      ) : null}
      <Link href="/login" className="mt-5 inline-block text-sm font-semibold text-rose-700 hover:text-rose-500">Return to log in</Link>
    </Card>
  );
}
