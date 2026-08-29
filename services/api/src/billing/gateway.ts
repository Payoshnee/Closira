export type BillingGatewayKey = "manual" | "stripe" | "razorpay" | "paddle" | "paypal" | "lemon-squeezy" | "custom" | string;

export type CheckoutInput = {
  userId: string;
  email: string;
  plan: "FREE" | "PRO" | "STYLIST" | "ENTERPRISE";
  successUrl?: string;
  cancelUrl?: string;
};

export type CheckoutSession = {
  gateway: BillingGatewayKey;
  checkoutUrl: string;
  providerCustomerId?: string;
  providerSubscriptionId?: string;
};

export type BillingPortalSession = {
  gateway: BillingGatewayKey;
  portalUrl: string;
};

export type GatewayWebhookResult = {
  eventId?: string;
  eventType: string;
  providerCustomerId?: string;
  providerSubscriptionId?: string;
  providerInvoiceId?: string;
  status?: string;
  plan?: string;
  amountDue?: number;
  currency?: string;
};

export interface PaymentGatewayAdapter {
  key: BillingGatewayKey;
  createCheckout(input: CheckoutInput): Promise<CheckoutSession>;
  createPortal(customerId: string): Promise<BillingPortalSession>;
  parseWebhook(rawBody: unknown, headers: Record<string, string | string[] | undefined>): Promise<GatewayWebhookResult>;
}

export const planPrices: Record<string, { amount: number; currency: string; label: string; limits: string[] }> = {
  FREE: { amount: 0, currency: "USD", label: "$0/mo", limits: ["50 wardrobe items", "25 AI requests/month", "Community support"] },
  PRO: { amount: 19, currency: "USD", label: "$19/mo", limits: ["500 wardrobe items", "1,000 AI requests/month", "Advanced outfits and analytics"] },
  STYLIST: { amount: 49, currency: "USD", label: "$49/mo", limits: ["Unlimited wardrobe items", "5,000 AI requests/month", "Priority AI styling workflows"] },
  ENTERPRISE: { amount: 199, currency: "USD", label: "Custom", limits: ["Team controls", "Custom AI providers", "SLA and admin reporting"] }
};
