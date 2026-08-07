export type ShoppingAssistantStatus = { available: false; reason: string };
export async function getShoppingAssistantStatus(): Promise<ShoppingAssistantStatus> {
  return { available: false, reason: "Shopping assistant API is scheduled for Run 5." };
}

