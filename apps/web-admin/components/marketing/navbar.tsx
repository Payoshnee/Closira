"use client";

import { Menu, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ButtonLink } from "@/components/ui/button";
import { publicNavItems, routes } from "@/lib/routes";

export function MarketingNavbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200/70 bg-ivory-50/88 backdrop-blur-xl">
      <nav className="mx-auto flex min-h-16 max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8" aria-label="Main navigation">
        <Link href={routes.home} className="flex items-center gap-2 text-base font-bold text-charcoal">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-charcoal text-white">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
          </span>
          Clorisa
        </Link>
        <div className="hidden items-center gap-7 md:flex">
          {publicNavItems.map((item) => (
            <Link key={item.href} href={item.href} className="text-sm font-medium text-stone-700 transition hover:text-charcoal">
              {item.label}
            </Link>
          ))}
        </div>
        <div className="hidden items-center gap-3 md:flex">
          <ButtonLink href={routes.login} variant="ghost">
            Log in
          </ButtonLink>
          <ButtonLink href={routes.signup}>Start organizing</ButtonLink>
        </div>
        <button
          type="button"
          className="grid h-11 w-11 place-items-center rounded-lg border border-stone-300 bg-white md:hidden"
          aria-label="Toggle navigation menu"
          aria-expanded={isOpen}
          onClick={() => setIsOpen((value) => !value)}
        >
          {isOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
        </button>
      </nav>
      {isOpen ? (
        <div className="border-t border-stone-200 bg-ivory-50 px-5 py-4 md:hidden">
          <div className="flex flex-col gap-2">
            {publicNavItems.map((item) => (
              <Link key={item.href} href={item.href} className="rounded-lg px-3 py-3 text-sm font-medium text-stone-800" onClick={() => setIsOpen(false)}>
                {item.label}
              </Link>
            ))}
            <ButtonLink href={routes.login} variant="secondary" className="mt-2" onClick={() => setIsOpen(false)}>
              Log in
            </ButtonLink>
            <ButtonLink href={routes.signup} onClick={() => setIsOpen(false)}>
              Start organizing
            </ButtonLink>
          </div>
        </div>
      ) : null}
    </header>
  );
}

