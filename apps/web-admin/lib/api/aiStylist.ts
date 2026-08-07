export type AiStylistStatus = { available: false; reason: string };
export async function getAiStylistStatus(): Promise<AiStylistStatus> {
  return { available: false, reason: "AI stylist API is scheduled for Run 5." };
}

