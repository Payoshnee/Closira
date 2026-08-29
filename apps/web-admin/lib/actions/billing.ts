"use server";

import { redirect } from "next/navigation";
import { createBillingPortalSession, createCheckoutSession } from "@/lib/api/billing";

export async function startCheckout(formData: FormData) {
  const plan = stringValue(formData.get("plan")) ?? "PRO";
  const gateway = stringValue(formData.get("gateway")) ?? "manual";
  const session = await createCheckoutSession({ plan, gateway });
  if (session?.checkoutUrl) redirect(session.checkoutUrl);
}

export async function openBillingPortal() {
  const session = await createBillingPortalSession();
  if (session?.portalUrl) redirect(session.portalUrl);
}

function stringValue(value: FormDataEntryValue | null) {
  return typeof value === "string" && value.trim() ? value : undefined;
}
