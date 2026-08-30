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
export declare const planPrices: Record<string, {
    amount: number;
    currency: string;
    label: string;
    taxMode: string;
    limits: string[];
}>;
