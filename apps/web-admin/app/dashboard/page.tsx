import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { getWardrobeSummary } from "@/lib/api/wardrobe";

export default async function DashboardPage() {
  const summary = await getWardrobeSummary();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-rose-700">Dashboard</p>
        <h1 className="mt-2 text-3xl font-bold text-charcoal">Wardrobe workspace</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">Run 3 adds wardrobe, categories, and tags. Outfits, calendar, AI, analytics, billing, and admin stay deferred.</p>
      </div>
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-charcoal">Wardrobe snapshot</h2>
        <p className="mt-3 text-sm leading-6 text-stone-600">
          {summary.totalItems} tracked items, {summary.favoriteItems} favorites, and {summary.neverWornItems} never-worn pieces ready for outfit planning.
        </p>
        <Link href="/dashboard/wardrobe" className="mt-5 inline-flex items-center text-sm font-semibold text-rose-700 hover:text-rose-500">
          Open wardrobe
          <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
        </Link>
      </Card>
    </div>
  );
}

