import type { BillingPortalSession, CheckoutInput, CheckoutSession, GatewayWebhookResult, PaymentGatewayAdapter } from "./gateway";
export declare class ManualGatewayAdapter implements PaymentGatewayAdapter {
    key: string;
    createCheckout(input: CheckoutInput): Promise<CheckoutSession>;
    createPortal(customerId: string): Promise<BillingPortalSession>;
    parseWebhook(rawBody: unknown): Promise<GatewayWebhookResult>;
}
export declare class OpenCheckoutGatewayAdapter implements PaymentGatewayAdapter {
    readonly key: string;
    private readonly config;
    constructor(key: string, config: {
        baseUrl?: string;
        secret?: string;
    });
    createCheckout(input: CheckoutInput): Promise<CheckoutSession>;
    createPortal(customerId: string): Promise<BillingPortalSession>;
    parseWebhook(rawBody: unknown): Promise<GatewayWebhookResult>;
}
