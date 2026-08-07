export type AnalyticsStatus = { available: false; reason: string };
export async function getAnalyticsStatus(): Promise<AnalyticsStatus> {
  return { available: false, reason: "Analytics API is scheduled for Run 5." };
}

