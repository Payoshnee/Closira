"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useState, useTransition } from "react";
import { submitAuthIntent } from "@/lib/api/auth";
import type { AuthIntent } from "@/types/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function AuthForm({
  title,
  description,
  cta,
  intent,
  footer,
  includeName = false,
  includePassword = true
}: {
  title: string;
  description: string;
  cta: string;
  intent: AuthIntent;
  footer: ReactNode;
  includeName?: boolean;
  includePassword?: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  function onSubmit(formData: FormData) {
    setMessage(null);
    setIsError(false);
    startTransition(async () => {
      const result = await submitAuthIntent(intent, formData);
      setMessage(result.message);
      setIsError(result.status === "error");

      if (result.status === "success" && intent !== "forgot-password") {
        router.push("/dashboard");
        router.refresh();
      }
    });
  }

  return (
    <Card className="mx-auto w-full max-w-md p-6 shadow-soft">
      <h1 className="text-2xl font-bold text-charcoal">{title}</h1>
      <p className="mt-2 text-sm leading-6 text-stone-600">{description}</p>
      <form className="mt-6 space-y-4" action={onSubmit}>
        {includeName ? (
          <label className="block text-sm font-medium text-charcoal">
            Name
            <Input className="mt-2" name="name" autoComplete="name" required />
          </label>
        ) : null}
        <label className="block text-sm font-medium text-charcoal">
          Email
          <Input className="mt-2" name="email" type="email" autoComplete="email" required />
        </label>
        {includePassword ? (
          <label className="block text-sm font-medium text-charcoal">
            Password
            <Input
              className="mt-2"
              name="password"
              type="password"
              autoComplete={includeName ? "new-password" : "current-password"}
              minLength={8}
              required
            />
          </label>
        ) : null}
        <Button className="w-full" type="submit" disabled={isPending}>
          {isPending ? "Working..." : cta}
        </Button>
      </form>
      {message ? (
        <p className={`mt-4 text-sm ${isError ? "text-red-700" : "text-emerald-700"}`} role="status">
          {message}
        </p>
      ) : null}
      <div className="mt-5 text-sm text-stone-600">{footer}</div>
      {includePassword && !includeName ? (
        <Link href="/forgot-password" className="mt-3 inline-block text-sm font-semibold text-rose-700 hover:text-rose-500">
          Forgot password?
        </Link>
      ) : null}
    </Card>
  );
}
