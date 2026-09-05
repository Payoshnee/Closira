import { SearchCheck } from "lucide-react";
import { SimplePage } from "@/components/marketing/simple-page";
import { Card } from "@/components/ui/card";

export default function SmartShoppingPage() {
  return (
    <SimplePage eyebrow="Smart shopping" title="Check before you buy another duplicate." description="Clorisa helps compare wishlist pieces against your existing wardrobe so new purchases fill real gaps.">
      <Card className="p-8">
        <SearchCheck className="h-8 w-8 text-rose-700" aria-hidden="true" />
        <h2 className="mt-6 text-3xl font-bold text-charcoal">Buy with wardrobe context.</h2>
        <p className="mt-4 max-w-3xl leading-7 text-stone-600">The shopping assistant roadmap includes similarity checks, outfit compatibility, missing-basics guidance, and clear separation between owned-wardrobe styling and shopping suggestions.</p>
      </Card>
    </SimplePage>
  );
}

