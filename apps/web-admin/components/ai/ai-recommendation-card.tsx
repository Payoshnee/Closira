import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { AiStylistRecommendation } from "@/types/ai";

export function AiRecommendationCard({ recommendation }: { recommendation: AiStylistRecommendation }) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Badge>{recommendation.occasion}</Badge>
          <h2 className="mt-3 text-xl font-bold text-charcoal">{recommendation.title}</h2>
          <p className="mt-2 text-sm italic text-stone-500">&quot;{recommendation.prompt}&quot;</p>
        </div>
        <div className="grid h-12 w-12 place-items-center rounded-lg bg-rose-50 text-rose-700">
          <Sparkles className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>
      <p className="mt-4 text-sm leading-6 text-stone-600">{recommendation.explanation}</p>
      <div className="mt-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Confidence</p>
        <div className="mt-2 h-2 rounded-full bg-stone-200">
          <div className="h-2 rounded-full bg-rose-500" style={{ width: `${Math.round(recommendation.confidence * 100)}%` }} />
        </div>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {recommendation.items.map((item) => (
          <div key={item.id} className={`rounded-lg bg-gradient-to-br ${item.images[0]?.gradient ?? "from-ivory-100 to-rose-100"} p-3`}>
            <div className="rounded-md bg-white/60 p-3 text-xs font-semibold text-charcoal">{item.title}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}

