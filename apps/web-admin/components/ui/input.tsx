import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "min-h-11 w-full rounded-lg border border-stone-300 bg-white px-3 text-sm text-charcoal shadow-line outline-none transition placeholder:text-stone-400 focus:border-rose-500 focus:ring-4 focus:ring-rose-100",
        className
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-32 w-full rounded-lg border border-stone-300 bg-white px-3 py-3 text-sm text-charcoal shadow-line outline-none transition placeholder:text-stone-400 focus:border-rose-500 focus:ring-4 focus:ring-rose-100",
        className
      )}
      {...props}
    />
  );
}

