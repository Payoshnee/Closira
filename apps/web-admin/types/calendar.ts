import type { Outfit } from "@/types/outfits";

export type CalendarConflictStatus = "none" | "warning";

export type OutfitCalendarEvent = {
  id: string;
  outfitId: string;
  outfit: Outfit;
  eventName: string;
  eventType: string;
  startsAt: string;
  endsAt: string;
  location: string;
  notes: string;
  conflictStatus: CalendarConflictStatus;
  reminderStatus: "none" | "scheduled";
};

export type CalendarSummary = {
  plannedOutfits: number;
  conflictWarnings: number;
  nextEventName: string;
  nextEventDate: string;
};

