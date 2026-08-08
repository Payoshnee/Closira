import { CalendarDays } from "lucide-react";
import { CalendarList } from "@/components/outfits";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getCalendarSummary, listCalendarEvents } from "@/lib/api/calendar";

export default async function CalendarPage() {
  const [summary, events] = await Promise.all([getCalendarSummary(), listCalendarEvents()]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-rose-700">Calendar</p>
          <h1 className="mt-2 text-3xl font-bold text-charcoal">Outfit calendar</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">Plan saved outfits for events and surface conflict warnings before you repeat a look too soon.</p>
        </div>
        <ButtonLink href="/dashboard/calendar/new" variant="secondary">Plan outfit</ButtonLink>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-5">
          <CalendarDays className="h-5 w-5 text-rose-700" aria-hidden="true" />
          <p className="mt-4 text-2xl font-bold text-charcoal">{summary.plannedOutfits}</p>
          <p className="mt-1 text-sm text-stone-600">Planned outfits</p>
        </Card>
        <Card className="p-5">
          <p className="text-2xl font-bold text-charcoal">{summary.conflictWarnings}</p>
          <p className="mt-1 text-sm text-stone-600">Conflict warnings</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm font-semibold text-stone-600">Next event</p>
          <p className="mt-3 text-lg font-bold text-charcoal">{summary.nextEventName}</p>
        </Card>
      </div>
      <CalendarList events={events} />
    </div>
  );
}

