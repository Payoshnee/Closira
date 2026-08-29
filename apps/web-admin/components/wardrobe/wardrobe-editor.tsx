"use client";

import Link from "next/link";
import { useActionState } from "react";
import { saveWardrobeItem } from "@/lib/actions/wardrobe";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";
import type { Category, Tag, WardrobeItem } from "@/types/wardrobe";

export function WardrobeEditor({
  title,
  description,
  categories,
  tags,
  item
}: {
  title: string;
  description: string;
  categories: Category[];
  tags: Tag[];
  item?: WardrobeItem;
}) {
  const [state, formAction, pending] = useActionState(saveWardrobeItem.bind(null, item?.id), {
    status: "ready" as const,
    message: ""
  });

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-rose-700">Wardrobe metadata</p>
        <h1 className="mt-2 text-3xl font-bold text-charcoal">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">{description}</p>
      </div>
      <Card className="p-6">
        <form className="grid gap-5 md:grid-cols-2" action={formAction}>
          <label className="block text-sm font-medium text-charcoal">
            Item title
            <Input className="mt-2" name="title" defaultValue={item?.title} required />
          </label>
          <label className="block text-sm font-medium text-charcoal">
            Category
            <select name="categoryId" defaultValue={item?.categoryId} className="mt-2 min-h-11 w-full rounded-lg border border-stone-300 bg-white px-3 text-sm text-charcoal shadow-line" required>
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-medium text-charcoal">
            Primary color
            <Input className="mt-2" name="primaryColor" defaultValue={item?.primaryColor} required />
          </label>
          <label className="block text-sm font-medium text-charcoal">
            Material
            <Input className="mt-2" name="material" defaultValue={item?.material} required />
          </label>
          <label className="block text-sm font-medium text-charcoal">
            Brand
            <Input className="mt-2" name="brand" defaultValue={item?.brand} />
          </label>
          <label className="block text-sm font-medium text-charcoal">
            Size
            <Input className="mt-2" name="size" defaultValue={item?.size} />
          </label>
          <label className="block text-sm font-medium text-charcoal">
            Storage location
            <Input className="mt-2" name="storageLocation" defaultValue={item?.storageLocation} />
          </label>
          <label className="block text-sm font-medium text-charcoal">
            Tags
            <select name="tagId" defaultValue={item?.tags[0]?.id} className="mt-2 min-h-11 w-full rounded-lg border border-stone-300 bg-white px-3 text-sm text-charcoal shadow-line">
              <option value="">Select primary tag</option>
              {tags.map((tag) => (
                <option key={tag.id} value={tag.id}>{tag.name}</option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-medium text-charcoal md:col-span-2">
            Notes
            <Textarea className="mt-2" name="notes" defaultValue={item?.notes} />
          </label>
          {state.status === "error" ? (
            <p className="text-sm font-medium text-red-700 md:col-span-2" role="alert">{state.message}</p>
          ) : null}
          <div className="flex flex-col gap-3 sm:flex-row md:col-span-2">
            <Button type="submit" disabled={pending}>{pending ? "Saving..." : item ? "Save metadata" : "Create item"}</Button>
            <Link href="/dashboard/wardrobe" className="inline-flex min-h-11 items-center justify-center rounded-lg border border-stone-300 bg-white px-5 py-2.5 text-sm font-semibold text-charcoal hover:bg-ivory-100">
              Cancel
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
