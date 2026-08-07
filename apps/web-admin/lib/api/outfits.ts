export type OutfitsStatus = { available: false; reason: string };
export async function getOutfitsStatus(): Promise<OutfitsStatus> {
  return { available: false, reason: "Outfits API is scheduled for Run 4." };
}

