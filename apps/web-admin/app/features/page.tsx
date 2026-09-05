import { FeatureCard } from "@/components/marketing/feature-card";
import { SimplePage } from "@/components/marketing/simple-page";
import { featureHighlights } from "@/lib/mock/marketing";

export default function FeaturesPage() {
  return (
    <SimplePage eyebrow="Features" title="Everything your wardrobe needs to become usable again." description="Clorisa combines organization, planning, AI assistance, and analytics in one private wardrobe system.">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {featureHighlights.map((feature) => (
          <FeatureCard key={feature.title} feature={feature} />
        ))}
      </div>
    </SimplePage>
  );
}

