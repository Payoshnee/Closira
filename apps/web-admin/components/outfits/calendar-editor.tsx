"use client";

import Link from "next/link";
import { useActionState } from "react";
import { planCalendarOutfit } from "@/lib/actions/outfits";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";
import type { Outfit } from "@/types/outfits";

export function CalendarEditor({ outfits }: { outfits: Outfit[] }) {
  const [state, action, pending] = useActionState(planCalendarOutfit, {
    status: "ready" as const,
    message: ""
  });

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-rose-700">Outfit calendar</p>
        <h1 className="mt-2 text-3xl font-bold text-charcoal">Plan an outfit</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">Schedule a saved outfit and check for repeated-outfit conflicts on the same day.</p>
      </div>
      <Card className="p-6">
        <form action={action} className="grid gap-5 md:grid-cols-2">
          <label className="block text-sm font-medium text-charcoal">
            Event name
            <Input className="mt-2" name="eventName" required />
          </label>
          <label className="block text-sm font-medium text-charcoal">
            Event type
            <Input className="mt-2" name="eventType" placeholder="Office, wedding, travel" required />
          </label>
          <label className="block text-sm font-medium text-charcoal">
            Outfit
            <select name="outfitId" className="mt-2 min-h-11 w-full rounded-lg border border-stone-300 bg-white px-3 text-sm text-charcoal shadow-line" required>
              <option value="">Select outfit</option>
              {outfits.map((outfit) => (
                <option key={outfit.id} value={outfit.id}>{outfit.name}</option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-medium text-charcoal">
            Starts at
            <Input className="mt-2" name="startsAt" type="datetime-local" required />
          </label>
          <label className="block text-sm font-medium text-charcoal">
            Location
            <Input className="mt-2" name="location" />
          </label>
          <label className="block text-sm font-medium text-charcoal md:col-span-2">
            Notes
            <Textarea className="mt-2" name="notes" />
          </label>
          {state.status === "error" ? (
            <p className="text-sm font-medium text-red-700 md:col-span-2" role="alert">{state.message}</p>
          ) : null}
          <div className="flex flex-col gap-3 sm:flex-row md:col-span-2">
            <Button type="submit" disabled={pending}>{pending ? "Planning..." : "Plan outfit"}</Button>
            <Link href="/dashboard/calendar" className="inline-flex min-h-11 items-center justify-center rounded-lg border border-stone-300 bg-white px-5 py-2.5 text-sm font-semibold text-charcoal hover:bg-ivory-100">
              Cancel
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
