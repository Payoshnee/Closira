import { mockBillingPlan, mockPaymentRecords } from "@/lib/mock/billing";
import type { BillingPlan, PaymentRecord } from "@/types/billing";

export async function getBillingPlan(): Promise<BillingPlan> {
  // TODO: Replace mock adapter with billing provider backed endpoint once implemented.
  return mockBillingPlan;
}

export async function listPaymentRecords(): Promise<PaymentRecord[]> {
  // TODO: Replace mock adapter with real payment records once implemented.
  return mockPaymentRecords;
}
