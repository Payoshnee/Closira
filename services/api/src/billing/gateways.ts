import type { BillingPortalSession, CheckoutInput, CheckoutSession, GatewayWebhookResult, PaymentGatewayAdapter } from "./gateway";

export class ManualGatewayAdapter implements PaymentGatewayAdapter {
  key = "manual";

  async createCheckout(input: CheckoutInput): Promise<CheckoutSession> {
    return {
      gateway: this.key,
      checkoutUrl: `/dashboard/billing?checkout=manual&plan=${input.plan.toLowerCase()}`,
      providerCustomerId: `manual_customer_${input.userId}`,
      providerSubscriptionId: `manual_subscription_${input.userId}_${input.plan.toLowerCase()}`
    };
  }

  async createPortal(customerId: string): Promise<BillingPortalSession> {
    return { gateway: this.key, portalUrl: `/dashboard/billing?portal=manual&customer=${encodeURIComponent(customerId)}` };
  }

  async parseWebhook(rawBody: unknown): Promise<GatewayWebhookResult> {
    const body = rawBody as { type?: string; subscriptionId?: string; customerId?: string; plan?: string; status?: string };
    return {
      eventType: body.type ?? "manual.subscription.updated",
      providerCustomerId: body.customerId,
      providerSubscriptionId: body.subscriptionId,
      plan: body.plan,
      status: body.status
    };
  }
}

export class OpenCheckoutGatewayAdapter implements PaymentGatewayAdapter {
  constructor(
    readonly key: string,
    private readonly config: { baseUrl?: string; secret?: string }
  ) {}

  async createCheckout(input: CheckoutInput): Promise<CheckoutSession> {
    if (!this.config.baseUrl || !this.config.secret) {
      throw new Error(`${this.key} checkout is not configured.`);
    }

    const response = await postJson(`${this.config.baseUrl.replace(/\/$/, "")}/checkout/sessions`, input, this.config.secret);
    return {
      gateway: this.key,
      checkoutUrl: stringValue(response.checkoutUrl) ?? stringValue(response.url) ?? input.cancelUrl ?? "/dashboard/billing",
      providerCustomerId: stringValue(response.customerId),
      providerSubscriptionId: stringValue(response.subscriptionId)
    };
  }

  async createPortal(customerId: string): Promise<BillingPortalSession> {
    if (!this.config.baseUrl || !this.config.secret) {
      throw new Error(`${this.key} portal is not configured.`);
    }

    const response = await postJson(`${this.config.baseUrl.replace(/\/$/, "")}/billing/portal`, { customerId }, this.config.secret);
    return { gateway: this.key, portalUrl: stringValue(response.portalUrl) ?? stringValue(response.url) ?? "/dashboard/billing" };
  }

  async parseWebhook(rawBody: unknown): Promise<GatewayWebhookResult> {
    const body = rawBody as Record<string, unknown>;
    return {
      eventId: stringValue(body.id),
      eventType: stringValue(body.type) ?? `${this.key}.webhook`,
      providerCustomerId: stringValue(body.customerId) ?? stringValue(body.customer_id),
      providerSubscriptionId: stringValue(body.subscriptionId) ?? stringValue(body.subscription_id),
      providerInvoiceId: stringValue(body.invoiceId) ?? stringValue(body.invoice_id),
      status: stringValue(body.status),
      plan: stringValue(body.plan),
      amountDue: numberValue(body.amountDue) ?? numberValue(body.amount_due),
      currency: stringValue(body.currency)
    };
  }
}

async function postJson(url: string, body: unknown, secret: string) {
  const response = await fetch(url, {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json", Authorization: `Bearer ${secret}` },
    body: JSON.stringify(body)
  });
  if (!response.ok) throw new Error(`Gateway request failed with status ${response.status}`);
  return response.json() as Promise<Record<string, unknown>>;
}

function stringValue(value: unknown) {
  return typeof value === "string" && value.trim() ? value : undefined;
}

function numberValue(value: unknown) {
  return typeof value === "number" ? value : undefined;
}
