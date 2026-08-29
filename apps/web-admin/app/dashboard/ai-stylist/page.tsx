import { AiRecommendationCard } from "@/components/ai";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { listAiStylistRecommendations, recommendOutfit } from "@/lib/api/aiStylist";

export default async function DashboardAiStylistPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const prompt = typeof params.prompt === "string" ? params.prompt.trim() : "";
  const [promptAnswer, recommendations] = await Promise.all([
    prompt ? recommendOutfit(prompt) : Promise.resolve(null),
    listAiStylistRecommendations()
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-rose-700">AI stylist</p>
          <h1 className="mt-2 text-3xl font-bold text-charcoal">Wardrobe-aware styling</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">Recommendations stay grounded in owned items, confidence, and editable outfit logic.</p>
        </div>
        <ButtonLink href="/dashboard/outfits/new" variant="secondary">Create from suggestion</ButtonLink>
      </div>
      <Card className="p-5">
        <form action="/dashboard/ai-stylist" className="grid gap-3 md:grid-cols-[1fr_auto]">
          <label className="block text-sm font-medium text-charcoal">
            Ask for a look
            <input name="prompt" defaultValue={prompt} className="mt-2 min-h-11 w-full rounded-lg border border-stone-300 bg-white px-3 text-sm text-charcoal shadow-line" placeholder="Example: outfit for dinner using pieces I have not worn lately" />
          </label>
          <div className="flex items-end">
            <button className="min-h-11 rounded-lg bg-charcoal px-5 text-sm font-semibold text-white" type="submit">Ask stylist</button>
          </div>
        </form>
      </Card>
      {prompt ? (
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-charcoal">Answer</h2>
          {promptAnswer ? (
            <AiRecommendationCard recommendation={promptAnswer} />
          ) : (
            <Card className="p-5">
              <h3 className="font-semibold text-charcoal">Could not answer yet</h3>
              <p className="mt-2 text-sm leading-6 text-stone-600">Start the API server with <code>./run.sh api</code> or <code>./run.sh all</code>, then submit the prompt again.</p>
            </Card>
          )}
        </section>
      ) : null}
      <h2 className="text-xl font-bold text-charcoal">Suggested prompts and examples</h2>
      <div className="grid gap-4 xl:grid-cols-2">
        {recommendations.map((recommendation) => (
          <AiRecommendationCard key={recommendation.id} recommendation={recommendation} />
        ))}
      </div>
    </div>
  );
}
