import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getWardrobeItem } from "@/lib/api/wardrobe";

export default async function WardrobeItemPage({ params }: { params: Promise<{ itemId: string }> }) {
  const { itemId } = await params;
  const item = await getWardrobeItem(itemId);

  if (!item) {
    notFound();
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <Card className="overflow-hidden">
        <div className={`aspect-[4/5] bg-gradient-to-br ${item.images[0]?.gradient ?? "from-ivory-100 to-rose-100"} p-6`}>
          <div className="h-full rounded-lg border border-white/60 bg-white/32 p-4">
            <Badge>{item.categoryName}</Badge>
          </div>
        </div>
      </Card>
      <div className="space-y-5">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-rose-700">Wardrobe item</p>
          <h1 className="mt-2 text-3xl font-bold text-charcoal">{item.title}</h1>
          <p className="mt-2 text-sm leading-6 text-stone-600">{item.notes}</p>
        </div>
        <Card className="p-5">
          <dl className="grid gap-4 sm:grid-cols-2">
            {[
              ["Category", item.categoryName],
              ["Color", [item.primaryColor, ...item.secondaryColors].join(", ")],
              ["Material", item.material],
              ["Pattern", item.pattern],
              ["Brand", item.brand],
              ["Size", item.size],
              ["Condition", item.condition],
              ["Storage", item.storageLocation],
              ["Usage", `${item.usageCount} wears`],
              ["Last worn", item.lastWornAt ?? "Never worn"]
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-xs font-semibold uppercase text-stone-500">{label}</dt>
                <dd className="mt-1 text-sm font-semibold text-charcoal">{value}</dd>
              </div>
            ))}
          </dl>
        </Card>
        <Card className="p-5">
          <h2 className="text-lg font-semibold text-charcoal">Tags</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {item.tags.map((tag) => (
              <Badge key={tag.id}>{tag.name}</Badge>
            ))}
          </div>
        </Card>
        <div className="flex flex-col gap-3 sm:flex-row">
          <ButtonLink href="/dashboard/wardrobe" variant="secondary">Back to wardrobe</ButtonLink>
          <ButtonLink href={`/dashboard/wardrobe/${item.id}/edit`}>Edit metadata</ButtonLink>
        </div>
      </div>
    </div>
  );
}

