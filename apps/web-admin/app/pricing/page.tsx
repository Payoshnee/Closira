import { CheckCircle2 } from "lucide-react";
import { SimplePage } from "@/components/marketing/simple-page";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { pricingPlans } from "@/lib/mock/marketing";
import { routes } from "@/lib/routes";

export default function PricingPage() {
  return (
    <SimplePage eyebrow="Pricing" title="Simple plans for early wardrobe builders." description="Clorisa is in foundation stage. Join early access now and get notified as premium AI tools become available.">
      <div className="grid gap-4 md:grid-cols-2">
        {pricingPlans.map((plan) => (
          <Card key={plan.name} className="p-6">
            <h2 className="text-2xl font-bold text-charcoal">{plan.name}</h2>
            <p className="mt-3 text-4xl font-bold text-rose-700">{plan.price}</p>
            <p className="mt-3 text-sm leading-6 text-stone-600">{plan.description}</p>
            <ul className="mt-6 space-y-3">
              {plan.features.map((feature) => (
                <li key={feature} className="flex gap-3 text-sm text-stone-700">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-sage" aria-hidden="true" />
                  {feature}
                </li>
              ))}
            </ul>
            <ButtonLink href={routes.signup} className="mt-7 w-full">
              {plan.cta}
            </ButtonLink>
          </Card>
        ))}
      </div>
    </SimplePage>
  );
}

