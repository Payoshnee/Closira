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
    if (this.key === "stripe") return parseStripeWebhook(body);
    if (this.key === "razorpay") return parseRazorpayWebhook(body);
    if (this.key === "paddle") return parsePaddleWebhook(body);
    if (this.key === "paypal") return parsePaypalWebhook(body);
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

function parseStripeWebhook(body: Record<string, unknown>): GatewayWebhookResult {
  const data = objectValue(objectValue(body.data)?.object);
  const lines = objectValue(data?.lines);
  const firstLine = Array.isArray(lines?.data) ? objectValue(lines.data[0]) : undefined;
  const price = objectValue(firstLine?.price);
  const metadata = objectValue(data?.metadata);
  return {
    eventId: stringValue(body.id),
    eventType: stringValue(body.type) ?? "stripe.webhook",
    providerCustomerId: stringValue(data?.customer),
    providerSubscriptionId: stringValue(data?.subscription) ?? stringValue(data?.id),
    providerInvoiceId: stringValue(data?.id),
    status: stringValue(data?.status),
    plan: stringValue(metadata?.plan) ?? stringValue(price?.lookup_key),
    amountDue: numberValue(data?.amount_due) ?? centsToMajor(numberValue(data?.amount_paid)),
    currency: stringValue(data?.currency)?.toUpperCase()
  };
}

function parseRazorpayWebhook(body: Record<string, unknown>): GatewayWebhookResult {
  const payload = objectValue(body.payload);
  const subscription = objectValue(objectValue(payload?.subscription)?.entity);
  const invoice = objectValue(objectValue(payload?.invoice)?.entity);
  const notes = objectValue(subscription?.notes) ?? objectValue(invoice?.notes);
  return {
    eventId: stringValue(body.event),
    eventType: stringValue(body.event) ?? "razorpay.webhook",
    providerCustomerId: stringValue(subscription?.customer_id) ?? stringValue(invoice?.customer_id),
    providerSubscriptionId: stringValue(subscription?.id) ?? stringValue(invoice?.subscription_id),
    providerInvoiceId: stringValue(invoice?.id),
    status: stringValue(subscription?.status) ?? stringValue(invoice?.status),
    plan: stringValue(notes?.plan),
    amountDue: paiseToMajor(numberValue(invoice?.amount_due) ?? numberValue(invoice?.amount_paid)),
    currency: stringValue(invoice?.currency)?.toUpperCase()
  };
}

function parsePaddleWebhook(body: Record<string, unknown>): GatewayWebhookResult {
  const data = objectValue(body.data) ?? body;
  const items = Array.isArray(data.items) ? objectValue(data.items[0]) : undefined;
  const price = objectValue(items?.price);
  return {
    eventId: stringValue(body.event_id) ?? stringValue(data.id),
    eventType: stringValue(body.event_type) ?? "paddle.webhook",
    providerCustomerId: stringValue(data.customer_id),
    providerSubscriptionId: stringValue(data.subscription_id) ?? stringValue(data.id),
    providerInvoiceId: stringValue(data.invoice_id) ?? stringValue(data.id),
    status: stringValue(data.status),
    plan: stringValue(price?.custom_data && objectValue(price.custom_data)?.plan) ?? stringValue(data.custom_data && objectValue(data.custom_data)?.plan),
    amountDue: numberValue(data.total),
    currency: stringValue(data.currency_code)?.toUpperCase()
  };
}

function parsePaypalWebhook(body: Record<string, unknown>): GatewayWebhookResult {
  const resource = objectValue(body.resource) ?? body;
  return {
    eventId: stringValue(body.id),
    eventType: stringValue(body.event_type) ?? "paypal.webhook",
    providerCustomerId: stringValue(resource.subscriber && objectValue(resource.subscriber)?.payer_id),
    providerSubscriptionId: stringValue(resource.billing_agreement_id) ?? stringValue(resource.id),
    providerInvoiceId: stringValue(resource.invoice_id) ?? stringValue(resource.id),
    status: stringValue(resource.status),
    plan: stringValue(resource.custom_id),
    amountDue: numberValue(objectValue(resource.amount)?.value),
    currency: stringValue(objectValue(resource.amount)?.currency_code)
  };
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
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim()) return Number(value);
  return undefined;
}

function objectValue(value: unknown) {
  return typeof value === "object" && value && !Array.isArray(value) ? (value as Record<string, unknown>) : undefined;
}

function centsToMajor(value?: number) {
  return typeof value === "number" ? value / 100 : undefined;
}

function paiseToMajor(value?: number) {
  return typeof value === "number" ? value / 100 : undefined;
}
