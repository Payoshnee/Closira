import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function SectionHeader({ eyebrow, title, description, inverted = false }: { eyebrow?: string; title: string; description: string; inverted?: boolean }) {
  return (
    <div className="max-w-3xl">
      {eyebrow ? <Badge>{eyebrow}</Badge> : null}
      <h2 className={cn("mt-4 text-3xl font-bold tracking-normal sm:text-4xl", inverted ? "text-white" : "text-charcoal")}>{title}</h2>
      <p className={cn("mt-4 text-base leading-7", inverted ? "text-stone-300" : "text-stone-600")}>{description}</p>
    </div>
  );
}
