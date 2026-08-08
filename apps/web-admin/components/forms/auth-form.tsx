import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function AuthForm({
  title,
  description,
  cta,
  action,
  footer,
  includeName = false,
  includePassword = true
}: {
  title: string;
  description: string;
  cta: string;
  action: string;
  footer: ReactNode;
  includeName?: boolean;
  includePassword?: boolean;
}) {
  return (
    <Card className="mx-auto w-full max-w-md p-6 shadow-soft">
      <h1 className="text-2xl font-bold text-charcoal">{title}</h1>
      <p className="mt-2 text-sm leading-6 text-stone-600">{description}</p>
      <form className="mt-6 space-y-4" action={action}>
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
            <Input className="mt-2" name="password" type="password" autoComplete={includeName ? "new-password" : "current-password"} required />
          </label>
        ) : null}
        <Button className="w-full" type="submit">
          {cta}
        </Button>
      </form>
      <div className="mt-5 text-sm text-stone-600">{footer}</div>
      {includePassword && !includeName ? (
        <Link href="/forgot-password" className="mt-3 inline-block text-sm font-semibold text-rose-700 hover:text-rose-500">
          Forgot password?
        </Link>
      ) : null}
    </Card>
  );
}

