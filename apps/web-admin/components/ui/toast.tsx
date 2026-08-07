import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function Toast({ message, className }: { message: string; className?: string }) {
  return (
    <div className={cn("inline-flex items-center gap-2 rounded-lg border border-stone-200 bg-white px-4 py-3 text-sm shadow-soft", className)}>
      <CheckCircle2 className="h-4 w-4 text-sage" aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}

