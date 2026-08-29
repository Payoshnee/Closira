import { CheckCircle2, CreditCard, ExternalLink } from "lucide-react";
import { openBillingPortal, startCheckout } from "@/lib/actions/billing";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { BillingGateway, BillingPlan, PaymentRecord } from "@/types/billing";

export function BillingPanel({
  plan,
  plans,
  gateways,
  payments
}: {
  plan: BillingPlan;
  plans: BillingPlan[];
  gateways: BillingGateway[];
  payments: PaymentRecord[];
}) {
  const enabledGateways = gateways.filter((gateway) => gateway.status !== "DISABLED");

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Card className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-rose-700">Current plan</p>
              <h2 className="mt-3 text-3xl font-bold text-charcoal">{plan.name}</h2>
              <p className="mt-2 text-2xl font-bold text-rose-700">{plan.price}</p>
            </div>
            <Badge>{plan.gateway ?? "manual"}</Badge>
          </div>
          <div className="mt-5 space-y-3">
            {plan.limits.map((limit) => (
              <p key={limit} className="flex gap-2 text-sm text-stone-700">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-sage" aria-hidden="true" />
                {limit}
              </p>
            ))}
          </div>
          <form action={openBillingPortal} className="mt-6">
            <Button type="submit" variant="secondary">
              <ExternalLink className="mr-2 h-4 w-4" aria-hidden="true" />
              Billing portal
            </Button>
          </form>
        </Card>

        <Card className="p-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-rose-700">Gateway checkout</p>
          <h2 className="mt-3 text-2xl font-bold text-charcoal">Choose any payment gateway</h2>
          <form action={startCheckout} className="mt-5 space-y-4">
            <label className="block text-sm font-medium text-charcoal">
              Plan
              <select name="plan" defaultValue={plan.code.toUpperCase()} className="mt-2 min-h-11 w-full rounded-lg border border-stone-300 bg-white px-3 text-sm text-charcoal shadow-line">
                {plans.map((option) => (
                  <option key={option.code} value={option.code.toUpperCase()}>{option.name} · {option.price}</option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-medium text-charcoal">
              Gateway
              <select name="gateway" defaultValue={plan.gateway ?? enabledGateways[0]?.key ?? "manual"} className="mt-2 min-h-11 w-full rounded-lg border border-stone-300 bg-white px-3 text-sm text-charcoal shadow-line">
                {(enabledGateways.length ? enabledGateways : [{ key: "manual", displayName: "Manual / dev billing", status: "ENABLED" as const, id: "manual" }]).map((gateway) => (
                  <option key={gateway.key} value={gateway.key}>{gateway.displayName} · {gateway.status.toLowerCase()}</option>
                ))}
              </select>
            </label>
            <Button type="submit">
              <CreditCard className="mr-2 h-4 w-4" aria-hidden="true" />
              Start checkout
            </Button>
          </form>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-bold text-charcoal">Payment records</h2>
        <div className="mt-5 space-y-3">
          {payments.map((payment) => (
            <div key={payment.id} className="flex flex-col gap-2 rounded-lg bg-ivory-100 p-4 text-sm sm:flex-row sm:items-center sm:justify-between">
              <span className="font-semibold text-charcoal">{payment.amount}</span>
              <span className="text-stone-600">{payment.gateway ?? "gateway"} · {payment.status} · {payment.paidAt}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
