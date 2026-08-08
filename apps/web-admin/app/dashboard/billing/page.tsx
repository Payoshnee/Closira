import { BillingPanel } from "@/components/billing";
import { getBillingPlan, listPaymentRecords } from "@/lib/api/billing";

export default async function BillingPage() {
  const [plan, payments] = await Promise.all([getBillingPlan(), listPaymentRecords()]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-rose-700">Billing</p>
        <h1 className="mt-2 text-3xl font-bold text-charcoal">Plan and payments</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">Track the current plan, payment history, and subscription readiness.</p>
      </div>
      <BillingPanel plan={plan} payments={payments} />
    </div>
  );
}

