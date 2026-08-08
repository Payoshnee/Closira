import { AlertTriangle, Bell, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { OutfitCalendarEvent } from "@/types/calendar";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" }).format(new Date(value));
}

export function CalendarList({ events }: { events: OutfitCalendarEvent[] }) {
  return (
    <div className="space-y-4">
      {events.map((event) => (
        <Card key={event.id} className="p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge>{event.eventType}</Badge>
                {event.conflictStatus === "warning" ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
                    <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
                    Conflict warning
                  </span>
                ) : null}
              </div>
              <h3 className="mt-3 text-xl font-semibold text-charcoal">{event.eventName}</h3>
              <p className="mt-1 text-sm text-stone-600">{formatDate(event.startsAt)}</p>
              <p className="mt-3 text-sm leading-6 text-stone-600">{event.notes}</p>
            </div>
            <div className="min-w-64 rounded-lg bg-ivory-100 p-4">
              <p className="font-semibold text-charcoal">{event.outfit.name}</p>
              <p className="mt-2 flex items-center gap-2 text-sm text-stone-600"><MapPin className="h-4 w-4" aria-hidden="true" /> {event.location}</p>
              <p className="mt-2 flex items-center gap-2 text-sm text-stone-600"><Bell className="h-4 w-4" aria-hidden="true" /> {event.reminderStatus}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

