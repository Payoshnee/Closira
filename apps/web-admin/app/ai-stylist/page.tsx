import { Sparkles } from "lucide-react";
import { SimplePage } from "@/components/marketing/simple-page";
import { Card } from "@/components/ui/card";

export default function AiStylistPage() {
  return (
    <SimplePage eyebrow="AI stylist" title="Outfit ideas from your own wardrobe." description="Clorisa's AI stylist is designed to recommend combinations from clothes you already own, with confidence and editable suggestions planned for the full release.">
      <Card className="bg-charcoal p-8 text-white">
        <Sparkles className="h-8 w-8 text-champagne" aria-hidden="true" />
        <h2 className="mt-6 text-3xl font-bold">Personal, not generic.</h2>
        <p className="mt-4 max-w-3xl leading-7 text-stone-300">The AI roadmap prioritizes your uploaded wardrobe metadata, usage history, occasions, colors, preferences, and privacy controls before broader shopping suggestions.</p>
      </Card>
    </SimplePage>
  );
}

