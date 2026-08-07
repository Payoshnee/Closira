export type CalendarStatus = { available: false; reason: string };
export async function getCalendarStatus(): Promise<CalendarStatus> {
  return { available: false, reason: "Calendar API is scheduled for Run 4." };
}

