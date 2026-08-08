import { SearchCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { ShoppingAssistantCheck } from "@/types/ai";

export function ShoppingCheckCard({ check }: { check: ShoppingAssistantCheck }) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Badge>{check.recommendation}</Badge>
          <h2 className="mt-3 text-xl font-bold text-charcoal">{check.itemName}</h2>
          <p className="mt-2 text-sm text-stone-600">Duplicate risk: {check.duplicateRisk}</p>
        </div>
        <SearchCheck className="h-6 w-6 text-rose-700" aria-hidden="true" />
      </div>
      <p className="mt-4 text-sm leading-6 text-stone-600">{check.explanation}</p>
      <div className="mt-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Compatibility score</p>
        <p className="mt-2 text-3xl font-bold text-charcoal">{check.compatibilityScore}%</p>
      </div>
      <div className="mt-5 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Similar owned items</p>
        {check.similarItems.map((item) => (
          <div key={item.id} className="rounded-lg bg-ivory-100 p-3 text-sm font-semibold text-charcoal">{item.title}</div>
        ))}
      </div>
    </Card>
  );
}

