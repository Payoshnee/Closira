import type { BillingPlan, PaymentRecord } from "@/types/billing";

export const mockBillingPlan: BillingPlan = {
  code: "early-access",
  name: "Early access",
  price: "$0",
  status: "active",
  limits: ["Unlimited local mock wardrobe", "AI previews", "Dashboard modules through Run 6"]
};

export const mockPaymentRecords: PaymentRecord[] = [
  { id: "pay-foundation", amount: "$0", status: "paid", paidAt: "2026-08-01" }
];

