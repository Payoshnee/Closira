"use client";

import { useActionState } from "react";
import { createTaxonomy } from "@/lib/actions/wardrobe";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function TaxonomyEditor({ mode }: { mode: "category" | "tag" }) {
  const isTag = mode === "tag";
  const [state, action, pending] = useActionState(createTaxonomy.bind(null, mode), {
    status: "ready" as const,
    message: ""
  });

  return (
    <Card className="p-5">
      <form className="grid gap-3 md:grid-cols-[1fr_220px_auto]" action={action}>
        <label className="block text-sm font-medium text-charcoal">
          {isTag ? "Tag name" : "Category name"}
          <Input className="mt-2" name="name" placeholder={isTag ? "Example: Brunch" : "Example: Occasion wear"} required />
        </label>
        {isTag ? (
          <label className="block text-sm font-medium text-charcoal">
            Tag type
            <select name="type" className="mt-2 min-h-11 w-full rounded-lg border border-stone-300 bg-white px-3 text-sm text-charcoal shadow-line">
              <option value="occasion">Occasion</option>
              <option value="season">Season</option>
              <option value="style">Style</option>
              <option value="custom">Custom</option>
            </select>
          </label>
        ) : (
          <label className="block text-sm font-medium text-charcoal">
            Sort order
            <Input className="mt-2" name="sortOrder" type="number" min="1" placeholder="6" />
          </label>
        )}
        <div className="flex items-end">
          <Button type="submit" className="w-full" disabled={pending}>{pending ? "Adding..." : isTag ? "Add tag" : "Add category"}</Button>
        </div>
        {state.message ? (
          <p className={`text-sm font-medium md:col-span-3 ${state.status === "error" ? "text-red-700" : "text-emerald-700"}`} role="status">
            {state.message}
          </p>
        ) : null}
      </form>
    </Card>
  );
}
