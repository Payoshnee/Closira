import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";
import type { Outfit } from "@/types/outfits";
import type { WardrobeItem } from "@/types/wardrobe";

export function OutfitEditor({ outfit, wardrobeItems }: { outfit?: Outfit; wardrobeItems: WardrobeItem[] }) {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-rose-700">Outfit builder</p>
        <h1 className="mt-2 text-3xl font-bold text-charcoal">{outfit ? "Edit outfit" : "Create outfit"}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">Build reusable outfit combinations from wardrobe pieces. Saving is prepared for the documented outfits API.</p>
      </div>
      <Card className="p-6">
        <form action="/dashboard/outfits" className="grid gap-5 md:grid-cols-2">
          <label className="block text-sm font-medium text-charcoal">
            Outfit name
            <Input className="mt-2" name="name" defaultValue={outfit?.name} required />
          </label>
          <label className="block text-sm font-medium text-charcoal">
            Occasion
            <Input className="mt-2" name="occasion" defaultValue={outfit?.occasion} required />
          </label>
          {["Primary piece", "Second piece", "Footwear or accessory"].map((label, index) => (
            <label key={label} className="block text-sm font-medium text-charcoal">
              {label}
              <select name={`item-${index}`} defaultValue={outfit?.items[index]?.wardrobeItem.id} className="mt-2 min-h-11 w-full rounded-lg border border-stone-300 bg-white px-3 text-sm text-charcoal shadow-line">
                <option value="">Select wardrobe item</option>
                {wardrobeItems.map((item) => (
                  <option key={item.id} value={item.id}>{item.title}</option>
                ))}
              </select>
            </label>
          ))}
          <label className="block text-sm font-medium text-charcoal md:col-span-2">
            Notes
            <Textarea className="mt-2" name="notes" defaultValue={outfit?.notes} />
          </label>
          <div className="flex flex-col gap-3 sm:flex-row md:col-span-2">
            <Button type="submit">{outfit ? "Save outfit" : "Create outfit"}</Button>
            <Link href="/dashboard/outfits" className="inline-flex min-h-11 items-center justify-center rounded-lg border border-stone-300 bg-white px-5 py-2.5 text-sm font-semibold text-charcoal hover:bg-ivory-100">
              Cancel
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}

