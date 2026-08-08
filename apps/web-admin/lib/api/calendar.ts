import { mockCalendarEvents, mockCalendarSummary } from "@/lib/mock/calendar";
import type { CalendarSummary, OutfitCalendarEvent } from "@/types/calendar";

export async function listCalendarEvents(): Promise<OutfitCalendarEvent[]> {
  // TODO: Replace mock adapter with GET /calendar/outfits once the NestJS endpoint is implemented.
  return mockCalendarEvents;
}

export async function getCalendarSummary(): Promise<CalendarSummary> {
  // TODO: Replace mock adapter with GET /calendar/outfits summary when available.
  return mockCalendarSummary;
}
