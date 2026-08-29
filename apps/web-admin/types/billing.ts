export type BillingPlan = {
  code: string;
  name: string;
  price: string;
  status: "active" | "coming-soon" | string;
  gateway?: string;
  entitlements?: Record<string, unknown>;
  limits: string[];
};

export type PaymentRecord = {
  id: string;
  amount: string;
  status: "paid" | "pending";
  paidAt: string;
  gateway?: string;
  hostedInvoiceUrl?: string;
};

export type BillingGateway = {
  id: string;
  key: string;
  displayName: string;
  status: "ENABLED" | "DISABLED" | "TESTING";
  baseUrl?: string | null;
};

export type CheckoutSession = {
  gateway: string;
  checkoutUrl: string;
  providerCustomerId?: string;
  providerSubscriptionId?: string;
};
