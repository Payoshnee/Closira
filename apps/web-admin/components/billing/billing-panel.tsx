import { CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { BillingPlan, PaymentRecord } from "@/types/billing";

export function BillingPanel({ plan, payments }: { plan: BillingPlan; payments: PaymentRecord[] }) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
      <Card className="p-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-rose-700">Current plan</p>
        <h2 className="mt-3 text-3xl font-bold text-charcoal">{plan.name}</h2>
        <p className="mt-2 text-2xl font-bold text-rose-700">{plan.price}</p>
        <div className="mt-5 space-y-3">
          {plan.limits.map((limit) => (
            <p key={limit} className="flex gap-2 text-sm text-stone-700">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-sage" aria-hidden="true" />
              {limit}
            </p>
          ))}
        </div>
      </Card>
      <Card className="p-6">
        <h2 className="text-xl font-bold text-charcoal">Payment records</h2>
        <div className="mt-5 space-y-3">
          {payments.map((payment) => (
            <div key={payment.id} className="flex items-center justify-between rounded-lg bg-ivory-100 p-4 text-sm">
              <span className="font-semibold text-charcoal">{payment.amount}</span>
              <span className="text-stone-600">{payment.status} · {payment.paidAt}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

