import { BarChart3, CalendarDays, CheckCircle2, CreditCard, ShieldCheck, Shirt, Sparkles, Tags, UserRound } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import type { AuthSession } from "@/types/auth";
import type { WardrobeSummary } from "@/types/wardrobe";

const activeModules = [
  { href: "/dashboard/wardrobe", label: "Wardrobe", description: "Browse, filter, and inspect item metadata.", icon: Shirt },
  { href: "/dashboard/categories", label: "Categories", description: "Manage wardrobe category structure.", icon: Tags },
  { href: "/dashboard/tags", label: "Tags", description: "Organize occasions, seasons, styles, and custom labels.", icon: Tags },
  { href: "/dashboard/outfits", label: "Outfits", description: "Build reusable combinations from wardrobe pieces.", icon: Shirt },
  { href: "/dashboard/calendar", label: "Calendar", description: "Plan outfits for events and catch repeat conflicts.", icon: CalendarDays },
  { href: "/dashboard/ai-stylist", label: "AI stylist", description: "Review wardrobe-grounded AI outfit ideas.", icon: Sparkles },
  { href: "/dashboard/shopping-assistant", label: "Shopping", description: "Check possible purchases against owned items.", icon: Sparkles },
  { href: "/dashboard/analytics", label: "Analytics", description: "Track value, usage, colors, and reuse signals.", icon: BarChart3 },
  { href: "/dashboard/profile", label: "Profile", description: "Manage account, privacy, and style preferences.", icon: UserRound },
  { href: "/dashboard/billing", label: "Billing", description: "Review plan, payment, and subscription readiness.", icon: CreditCard },
  { href: "/dashboard/admin", label: "Admin", description: "Monitor operational metrics and service health.", icon: ShieldCheck }
];

export function DashboardHome({ session, summary }: { session: AuthSession; summary: WardrobeSummary }) {
  return (
    <div className="space-y-8">
      <section className="rounded-lg bg-charcoal p-6 text-white shadow-soft lg:p-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-champagne">Dashboard home</p>
        <h1 className="mt-3 text-3xl font-bold sm:text-4xl">Welcome back, {session.user.name}.</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-300">This shell anchors Closira&apos;s authenticated workspace. Run 3 through Run 6 modules are active and ready for backend wiring.</p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Wardrobe items", summary.totalItems],
          ["Favorites", summary.favoriteItems],
          ["Never worn", summary.neverWornItems],
          ["Most used category", summary.mostUsedCategory]
        ].map(([label, value]) => (
          <Card key={label} className="p-5">
            <p className="text-sm font-medium text-stone-600">{label}</p>
            <p className="mt-3 text-2xl font-bold text-charcoal">{value}</p>
          </Card>
        ))}
      </section>

      <section>
        <h2 className="text-xl font-bold text-charcoal">Active modules</h2>
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          {activeModules.map((module) => {
            const Icon = module.icon;
            return (
              <Link key={module.href} href={module.href} className="group block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-rose-500">
                <Card className="h-full p-5 transition group-hover:-translate-y-0.5 group-hover:shadow-soft">
                  <Icon className="h-5 w-5 text-rose-700" aria-hidden="true" />
                  <h3 className="mt-4 font-semibold text-charcoal">{module.label}</h3>
                  <p className="mt-2 text-sm leading-6 text-stone-600">{module.description}</p>
                  <span className="mt-4 inline-flex items-center text-sm font-semibold text-rose-700">
                    Open
                    <CheckCircle2 className="ml-2 h-4 w-4" aria-hidden="true" />
                  </span>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

    </div>
  );
}
