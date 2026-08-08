import { Card } from "@/components/ui/card";
import type { AnalyticsMetric } from "@/types/analytics";

export function MetricGrid({ metrics }: { metrics: AnalyticsMetric[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => (
        <Card key={metric.label} className="p-5">
          <p className="text-sm font-medium text-stone-600">{metric.label}</p>
          <p className="mt-3 text-3xl font-bold text-charcoal">{metric.value}</p>
          <p className="mt-2 text-xs leading-5 text-stone-500">{metric.detail}</p>
        </Card>
      ))}
    </div>
  );
}

