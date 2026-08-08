export type BillingPlan = {
  code: string;
  name: string;
  price: string;
  status: "active" | "coming-soon";
  limits: string[];
};

export type PaymentRecord = {
  id: string;
  amount: string;
  status: "paid" | "pending";
  paidAt: string;
};

