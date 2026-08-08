import { ShoppingCheckCard } from "@/components/ai";
import { Card } from "@/components/ui/card";
import { listShoppingAssistantChecks } from "@/lib/api/shoppingAssistant";

export default async function ShoppingAssistantPage() {
  const checks = await listShoppingAssistantChecks();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-rose-700">Shopping assistant</p>
        <h1 className="mt-2 text-3xl font-bold text-charcoal">Check before buying</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">Compare possible purchases against your wardrobe before spending on duplicates.</p>
      </div>
      <Card className="p-5">
        <form action="/dashboard/shopping-assistant" className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
          <label className="block text-sm font-medium text-charcoal">
            Item name
            <input name="itemName" className="mt-2 min-h-11 w-full rounded-lg border border-stone-300 bg-white px-3 text-sm text-charcoal shadow-line" placeholder="Cream blazer" />
          </label>
          <label className="block text-sm font-medium text-charcoal">
            Intended occasion
            <input name="occasion" className="mt-2 min-h-11 w-full rounded-lg border border-stone-300 bg-white px-3 text-sm text-charcoal shadow-line" placeholder="Office, wedding, travel" />
          </label>
          <div className="flex items-end">
            <button className="min-h-11 rounded-lg bg-charcoal px-5 text-sm font-semibold text-white" type="submit">Check item</button>
          </div>
        </form>
      </Card>
      <div className="grid gap-4 xl:grid-cols-2">
        {checks.map((check) => (
          <ShoppingCheckCard key={check.id} check={check} />
        ))}
      </div>
    </div>
  );
}

