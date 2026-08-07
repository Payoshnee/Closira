import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { Category, Tag } from "@/types/wardrobe";

export function WardrobeFilters({ categories, tags }: { categories: Category[]; tags: Tag[] }) {
  return (
    <Card className="p-4">
      <form className="grid gap-3 md:grid-cols-[1.3fr_1fr_1fr_auto]" action="/dashboard/wardrobe">
        <label className="relative block">
          <span className="sr-only">Search wardrobe</span>
          <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-stone-400" aria-hidden="true" />
          <Input name="q" placeholder="Search wardrobe" className="pl-9" />
        </label>
        <label>
          <span className="sr-only">Category</span>
          <select name="categoryId" className="min-h-11 w-full rounded-lg border border-stone-300 bg-white px-3 text-sm text-charcoal shadow-line">
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
        </label>
        <label>
          <span className="sr-only">Tag</span>
          <select name="tagId" className="min-h-11 w-full rounded-lg border border-stone-300 bg-white px-3 text-sm text-charcoal shadow-line">
            <option value="">All tags</option>
            {tags.map((tag) => (
              <option key={tag.id} value={tag.id}>{tag.name}</option>
            ))}
          </select>
        </label>
        <Button type="submit">Apply</Button>
      </form>
    </Card>
  );
}

