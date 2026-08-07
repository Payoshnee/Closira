import type { MarketingFeature } from "@/types/marketing";
import { Card } from "@/components/ui/card";

export function FeatureCard({ feature }: { feature: MarketingFeature }) {
  const Icon = feature.icon;

  return (
    <Card className="p-5 transition hover:-translate-y-0.5 hover:shadow-soft">
      <div className="grid h-11 w-11 place-items-center rounded-lg bg-rose-50 text-rose-700">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <h3 className="mt-5 text-lg font-semibold text-charcoal">{feature.title}</h3>
      <p className="mt-2 text-sm leading-6 text-stone-600">{feature.description}</p>
    </Card>
  );
}

