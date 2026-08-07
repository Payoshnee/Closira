import { AlertCircle, Inbox } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-lg bg-stone-200/80", className)} />;
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <Card className="p-6 text-center">
      <Inbox className="mx-auto h-6 w-6 text-rose-500" aria-hidden="true" />
      <h3 className="mt-3 text-base font-semibold text-charcoal">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-stone-600">{description}</p>
    </Card>
  );
}

export function ErrorState({ title, description }: { title: string; description: string }) {
  return (
    <Card className="border-rose-200 bg-rose-50 p-6">
      <AlertCircle className="h-6 w-6 text-rose-700" aria-hidden="true" />
      <h3 className="mt-3 text-base font-semibold text-rose-900">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-rose-800">{description}</p>
    </Card>
  );
}

