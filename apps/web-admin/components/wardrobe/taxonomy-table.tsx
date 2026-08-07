import { Card } from "@/components/ui/card";
import type { Category, Tag } from "@/types/wardrobe";

type TaxonomyItem = Category | Tag;

export function TaxonomyTable({ title, items }: { title: string; items: TaxonomyItem[] }) {
  return (
    <Card className="overflow-hidden">
      <div className="border-b border-stone-200 px-5 py-4">
        <h2 className="text-lg font-semibold text-charcoal">{title}</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[620px] text-left text-sm">
          <thead className="bg-ivory-100 text-xs uppercase text-stone-500">
            <tr>
              <th className="px-5 py-3">Name</th>
              <th className="px-5 py-3">Type</th>
              <th className="px-5 py-3">Items</th>
              <th className="px-5 py-3">Source</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200 bg-white">
            {items.map((item) => (
              <tr key={item.id}>
                <td className="px-5 py-4 font-semibold text-charcoal">{item.name}</td>
                <td className="px-5 py-4 text-stone-600">{"type" in item ? item.type : "category"}</td>
                <td className="px-5 py-4 text-stone-600">{item.itemCount}</td>
                <td className="px-5 py-4 text-stone-600">{item.isDefault ? "Default" : "Custom"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

