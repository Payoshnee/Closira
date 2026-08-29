import { apiGet, apiPost } from "@/lib/api/client";
import { mockBillingPlan, mockPaymentRecords } from "@/lib/mock/billing";
import type { BillingGateway, BillingPlan, CheckoutSession, PaymentRecord } from "@/types/billing";

export async function getBillingPlan(): Promise<BillingPlan> {
  const result = await apiGet<BillingPlan>("/billing/current");
  return result.data ?? mockBillingPlan;
}

export async function listBillingPlans(): Promise<BillingPlan[]> {
  const result = await apiGet<BillingPlan[]>("/billing/plans");
  return result.data ?? [mockBillingPlan];
}

export async function listPaymentRecords(): Promise<PaymentRecord[]> {
  const result = await apiGet<PaymentRecord[]>("/billing/invoices");
  return result.data ?? mockPaymentRecords;
}

export async function listBillingGateways(): Promise<BillingGateway[]> {
  const result = await apiGet<BillingGateway[]>("/billing/gateways");
  return result.data ?? [];
}

export async function createCheckoutSession(body: { plan: string; gateway: string }): Promise<CheckoutSession | null> {
  const result = await apiPost<CheckoutSession, { plan: string; gateway: string }>("/billing/checkout", body);
  return result.data ?? null;
}

export async function createBillingPortalSession(): Promise<{ gateway: string; portalUrl: string } | null> {
  const result = await apiPost<{ gateway: string; portalUrl: string }, Record<string, never>>("/billing/portal", {});
  return result.data ?? null;
}
