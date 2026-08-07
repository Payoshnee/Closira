export type BillingStatus = { available: false; reason: string };
export async function getBillingStatus(): Promise<BillingStatus> {
  return { available: false, reason: "Billing API is scheduled for Run 6." };
}

