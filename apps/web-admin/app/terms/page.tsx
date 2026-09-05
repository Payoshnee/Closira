import { SimplePage } from "@/components/marketing/simple-page";
import { Card } from "@/components/ui/card";

export default function TermsPage() {
  return (
    <SimplePage eyebrow="Terms" title="Clear expectations for a personal wardrobe product." description="These launch-stage terms summarize intended use while the production legal terms are finalized.">
      <Card className="space-y-4 p-6 text-sm leading-7 text-stone-700">
        <p>Use Clorisa to organize clothing, create outfits, plan looks, and receive styling guidance from your own wardrobe.</p>
        <p>Do not upload content you do not have permission to use, and do not use AI features to impersonate or harm others.</p>
        <p>Production terms will be completed before paid plans or public availability.</p>
      </Card>
    </SimplePage>
  );
}

