import { apiGet } from "@/lib/api/client";
import { mockCalendarEvents, mockCalendarSummary } from "@/lib/mock/calendar";
import type { CalendarSummary, OutfitCalendarEvent } from "@/types/calendar";

export async function listCalendarEvents(): Promise<OutfitCalendarEvent[]> {
  const result = await apiGet<OutfitCalendarEvent[]>("/calendar/outfits");
  return result.data ?? mockCalendarEvents;
}

export async function getCalendarSummary(): Promise<CalendarSummary> {
  const result = await apiGet<CalendarSummary>("/calendar/summary");
  return result.data ?? mockCalendarSummary;
}
