import { SimplePage } from "@/components/marketing/simple-page";
import { Card } from "@/components/ui/card";
import { howItWorksSteps } from "@/lib/mock/marketing";

export default function HowItWorksPage() {
  return (
    <SimplePage eyebrow="How it works" title="A calm system for getting dressed." description="Closira starts with your real wardrobe, then helps you organize, style, plan, and shop with more intention.">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {howItWorksSteps.map((step, index) => (
          <Card key={step.title} className="p-6">
            <span className="text-sm font-bold text-rose-700">Step {index + 1}</span>
            <h2 className="mt-4 text-xl font-semibold text-charcoal">{step.title}</h2>
            <p className="mt-3 text-sm leading-6 text-stone-600">{step.description}</p>
          </Card>
        ))}
      </div>
    </SimplePage>
  );
}

