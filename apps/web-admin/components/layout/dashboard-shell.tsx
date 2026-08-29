import { BarChart3, CalendarDays, CreditCard, LayoutDashboard, Settings, ShieldCheck, Shirt, Sparkles, Tags, UserRound } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { routes } from "@/lib/routes";

const dashboardNav = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/dashboard/wardrobe", label: "Wardrobe", icon: Shirt },
  { href: "/dashboard/categories", label: "Categories", icon: Tags },
  { href: "/dashboard/tags", label: "Tags", icon: Tags },
  { href: "/dashboard/outfits", label: "Outfits", icon: Shirt },
  { href: "/dashboard/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/dashboard/ai-stylist", label: "AI stylist", icon: Sparkles },
  { href: "/dashboard/ai-settings", label: "AI settings", icon: Settings },
  { href: "/dashboard/shopping-assistant", label: "Shopping", icon: Sparkles },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/profile", label: "Profile", icon: UserRound },
  { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
  { href: "/dashboard/admin", label: "Admin", icon: ShieldCheck }
];

export function DashboardShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-ivory-50 text-charcoal">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-stone-200 bg-white/88 px-4 py-5 lg:block">
        <Link href={routes.home} className="text-lg font-bold">
          Closira
        </Link>
        <nav className="mt-8 space-y-1" aria-label="Dashboard navigation">
          {dashboardNav.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-semibold text-stone-700 hover:bg-ivory-100 hover:text-charcoal">
                <Icon className="h-4 w-4" aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 border-b border-stone-200 bg-ivory-50/88 px-5 py-4 backdrop-blur-xl lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <Link href="/dashboard" className="font-bold lg:hidden">
              Closira
            </Link>
            <div className="hidden text-sm text-stone-600 lg:block">Private wardrobe workspace</div>
            <Link href={routes.home} className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-semibold hover:bg-ivory-100">
              Public site
            </Link>
          </div>
          <nav className="mt-4 flex gap-2 overflow-x-auto pb-1 lg:hidden" aria-label="Mobile dashboard navigation">
            {dashboardNav.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href} className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-lg border border-stone-200 bg-white px-3 text-xs font-semibold text-stone-700">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </header>
        <main className="px-5 py-8 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
