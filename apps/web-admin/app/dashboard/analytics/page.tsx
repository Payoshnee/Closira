import { BarList, MetricGrid } from "@/components/analytics";
import { getWardrobeAnalytics } from "@/lib/api/analytics";

export default async function AnalyticsPage() {
  const analytics = await getWardrobeAnalytics();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-rose-700">Analytics</p>
        <h1 className="mt-2 text-3xl font-bold text-charcoal">Wardrobe intelligence</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">Track value, usage, cost per wear, unused items, category balance, and color distribution.</p>
      </div>
      <MetricGrid metrics={analytics.metrics} />
      <div className="grid gap-4 xl:grid-cols-3">
        <BarList title="Categories" slices={analytics.categoryBreakdown} />
        <BarList title="Usage" slices={analytics.usageBreakdown} />
        <BarList title="Colors" slices={analytics.colorBreakdown} />
      </div>
    </div>
  );
}

