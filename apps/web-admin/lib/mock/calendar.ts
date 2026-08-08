import { mockOutfits } from "@/lib/mock/outfits";
import type { CalendarSummary, OutfitCalendarEvent } from "@/types/calendar";

const byId = new Map(mockOutfits.map((outfit) => [outfit.id, outfit]));

function outfit(id: string) {
  const value = byId.get(id);
  if (!value) {
    throw new Error(`Missing mock outfit ${id}`);
  }
  return value;
}

export const mockCalendarEvents: OutfitCalendarEvent[] = [
  {
    id: "cal-office-review",
    outfitId: "outfit-office-capsule",
    outfit: outfit("outfit-office-capsule"),
    eventName: "Product review",
    eventType: "Office",
    startsAt: "2026-08-10T09:30:00.000Z",
    endsAt: "2026-08-10T11:00:00.000Z",
    location: "Studio office",
    notes: "Comfortable repeat look for a long desk day.",
    conflictStatus: "none",
    reminderStatus: "scheduled"
  },
  {
    id: "cal-friday-dinner",
    outfitId: "outfit-friday-dinner",
    outfit: outfit("outfit-friday-dinner"),
    eventName: "Friday dinner",
    eventType: "Dinner",
    startsAt: "2026-08-14T14:30:00.000Z",
    endsAt: "2026-08-14T17:00:00.000Z",
    location: "Bandra",
    notes: "Add light jewelry before leaving.",
    conflictStatus: "none",
    reminderStatus: "scheduled"
  },
  {
    id: "cal-wedding-sangeet",
    outfitId: "outfit-wedding-guest",
    outfit: outfit("outfit-wedding-guest"),
    eventName: "Sangeet night",
    eventType: "Wedding",
    startsAt: "2026-08-15T13:30:00.000Z",
    endsAt: "2026-08-15T18:00:00.000Z",
    location: "Juhu",
    notes: "Conflict warning because this outfit was used recently for a related occasion.",
    conflictStatus: "warning",
    reminderStatus: "none"
  }
];

export const mockCalendarSummary: CalendarSummary = {
  plannedOutfits: mockCalendarEvents.length,
  conflictWarnings: mockCalendarEvents.filter((event) => event.conflictStatus === "warning").length,
  nextEventName: mockCalendarEvents[0].eventName,
  nextEventDate: mockCalendarEvents[0].startsAt
};

