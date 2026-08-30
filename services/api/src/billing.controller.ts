import { Body, Controller, Get, Headers, Param, Post, Req, Res } from "@nestjs/common";
import { SubscriptionPlan, SubscriptionStatus } from "@prisma/client";
import type { Request, Response } from "express";
import { AuthService } from "./auth/auth.service";
import { requireCurrentUser } from "./auth/current-user";
import { ManualGatewayAdapter, OpenCheckoutGatewayAdapter } from "./billing/gateways";
import { PaymentGatewayAdapter, planPrices } from "./billing/gateway";
import { defaultEntitlements, verifyGatewaySignature } from "./billing/entitlements.service";
import { PrismaService } from "./prisma.service";

@Controller("billing")
export class BillingController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auth: AuthService
  ) {}

  @Get("plans")
  plans() {
    return Object.entries(planPrices).map(([code, plan]) => ({ code, name: title(code), price: plan.label, limits: plan.limits, status: "active" }));
  }

  @Get("current")
  async current(@Req() request: Request) {
    const user = requireCurrentUser(request, this.auth);
    const subscription = await this.prisma.subscription.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" }
    });
    const planCode = subscription?.plan ?? "FREE";
    const plan = planPrices[planCode];
    return {
      code: planCode.toLowerCase(),
      name: title(planCode),
      price: plan.label,
      status: subscription?.status.toLowerCase() ?? "active",
      gateway: subscription?.providerKey ?? "manual",
      entitlements: subscription?.entitlements ?? entitlementFor(planCode),
      limits: plan.limits
    };
  }

  @Get("invoices")
  async invoices(@Req() request: Request) {
    const user = requireCurrentUser(request, this.auth);
    const invoices = await this.prisma.invoice.findMany({
      where: { subscription: { userId: user.id } },
      orderBy: { createdAt: "desc" },
      take: 24
    });
    return invoices.map((invoice) => ({
      id: invoice.id,
      gateway: invoice.providerKey,
      amount: `${invoice.currency} ${Number(invoice.amountDue).toFixed(2)}`,
      status: invoice.status === "paid" ? "paid" : "pending",
      paidAt: invoice.paidAt?.toISOString() ?? invoice.issuedAt?.toISOString() ?? invoice.createdAt.toISOString(),
      hostedInvoiceUrl: invoice.hostedInvoiceUrl,
      downloadUrl: `/api/v1/billing/invoices/${invoice.id}/download`
    }));
  }

  @Get("invoices/:id/download")
  async downloadInvoice(@Req() request: Request, @Param("id") id: string, @Res() response: Response) {
    const user = requireCurrentUser(request, this.auth);
    const invoice = await this.prisma.invoice.findFirstOrThrow({
      where: { id, subscription: { userId: user.id } },
      include: { subscription: { include: { user: true } } }
    });
    const text = [
      "Closira Invoice",
      `Invoice: ${invoice.id}`,
      `Customer: ${invoice.subscription.user.email}`,
      `Gateway: ${invoice.providerKey}`,
      `Status: ${invoice.status}`,
      `Amount due: ${invoice.currency} ${Number(invoice.amountDue).toFixed(2)}`,
      `Issued: ${invoice.issuedAt?.toISOString() ?? invoice.createdAt.toISOString()}`,
      invoice.paidAt ? `Paid: ${invoice.paidAt.toISOString()}` : "Paid: pending"
    ].join("\n");
    response.setHeader("Content-Type", "text/plain; charset=utf-8");
    response.setHeader("Content-Disposition", `attachment; filename="closira-invoice-${invoice.id}.txt"`);
    response.send(text);
  }

  @Get("gateways")
  async gateways(@Req() request: Request) {
    const user = requireCurrentUser(request, this.auth);
    return this.prisma.billingGateway.findMany({
      where: { OR: [{ ownerId: null }, { ownerId: user.id }] },
      orderBy: [{ status: "asc" }, { displayName: "asc" }]
    });
  }

  @Post("gateways")
  async upsertGateway(
    @Req() request: Request,
    @Body() body: { key: string; displayName: string; baseUrl?: string; secretEnv?: string; webhookSecretEnv?: string; status?: "ENABLED" | "DISABLED" | "TESTING" }
  ) {
    const user = requireCurrentUser(request, this.auth);
    return this.prisma.billingGateway.upsert({
      where: { ownerId_key: { ownerId: user.id, key: body.key } },
      update: {
        displayName: body.displayName,
        baseUrl: body.baseUrl,
        secretRef: body.secretEnv,
        webhookSecretRef: body.webhookSecretEnv,
        status: body.status ?? "TESTING"
      },
      create: {
        ownerId: user.id,
        key: body.key,
        displayName: body.displayName,
        baseUrl: body.baseUrl,
        secretRef: body.secretEnv,
        webhookSecretRef: body.webhookSecretEnv,
        status: body.status ?? "TESTING"
      }
    });
  }

  @Post("checkout")
  async checkout(@Req() request: Request, @Body() body: { plan: SubscriptionPlan; gateway?: string; successUrl?: string; cancelUrl?: string }) {
    const user = requireCurrentUser(request, this.auth);
    const account = await this.prisma.user.findUniqueOrThrow({ where: { id: user.id } });
    const gatewayKey = body.gateway ?? process.env.DEFAULT_BILLING_GATEWAY ?? "manual";
    const gateway = await this.gatewayFor(user.id, gatewayKey);
    const session = await gateway.createCheckout({
      userId: user.id,
      email: account.email,
      plan: body.plan,
      successUrl: body.successUrl,
      cancelUrl: body.cancelUrl
    });

    await this.prisma.subscription.upsert({
      where: { stripeSubscriptionId: session.providerSubscriptionId ?? `manual_${user.id}_${body.plan.toLowerCase()}` },
      update: { plan: body.plan, providerKey: gateway.key, status: "ACTIVE", entitlements: entitlementFor(body.plan) },
      create: {
        userId: user.id,
        providerKey: gateway.key,
        plan: body.plan,
        status: "ACTIVE",
        stripeCustomerId: session.providerCustomerId,
        stripeSubscriptionId: session.providerSubscriptionId ?? `manual_${user.id}_${body.plan.toLowerCase()}`,
        entitlements: entitlementFor(body.plan)
      }
    });

    return session;
  }

  @Post("portal")
  async portal(@Req() request: Request) {
    const user = requireCurrentUser(request, this.auth);
    const subscription = await this.prisma.subscription.findFirstOrThrow({ where: { userId: user.id }, orderBy: { createdAt: "desc" } });
    const gateway = await this.gatewayFor(user.id, subscription.providerKey);
    return gateway.createPortal(subscription.stripeCustomerId ?? `manual_customer_${user.id}`);
  }

  @Post("webhooks/:gateway")
  async webhook(@Param("gateway") gatewayKey: string, @Body() body: unknown, @Headers() headers: Record<string, string | string[] | undefined>) {
    const gateway = await this.gatewayFor(null, gatewayKey);
    verifyGatewaySignature(body, headers, this.webhookSecretFor(gatewayKey));
    const event = await gateway.parseWebhook(body, headers);
    if (event.providerSubscriptionId && event.plan) {
      await this.prisma.subscription.updateMany({
        where: { stripeSubscriptionId: event.providerSubscriptionId },
        data: {
          providerKey: gateway.key,
          plan: normalizePlan(event.plan),
          status: normalizeStatus(event.status),
          entitlements: entitlementFor(normalizePlan(event.plan))
        }
      });
    }
    if (event.providerSubscriptionId && event.providerInvoiceId) {
      const subscription = await this.prisma.subscription.findUnique({ where: { stripeSubscriptionId: event.providerSubscriptionId } });
      if (subscription) {
        await this.prisma.invoice.upsert({
          where: { providerInvoiceId: event.providerInvoiceId },
          update: {
            providerKey: gateway.key,
            amountDue: event.amountDue ?? 0,
            currency: event.currency ?? process.env.BILLING_CURRENCY ?? "USD",
            status: invoiceStatus(event.eventType, event.status),
            paidAt: isPaidInvoice(event.eventType, event.status) ? new Date() : undefined
          },
          create: {
            subscriptionId: subscription.id,
            providerInvoiceId: event.providerInvoiceId,
            providerKey: gateway.key,
            amountDue: event.amountDue ?? 0,
            currency: event.currency ?? process.env.BILLING_CURRENCY ?? "USD",
            status: invoiceStatus(event.eventType, event.status),
            issuedAt: new Date(),
            paidAt: isPaidInvoice(event.eventType, event.status) ? new Date() : undefined
          }
        });
      }
    }
    return { ok: true, event };
  }

  private async gatewayFor(userId: string | null, key: string): Promise<PaymentGatewayAdapter> {
    if (key === "manual") return new ManualGatewayAdapter();
    const gateway = await this.prisma.billingGateway.findFirst({
      where: { key, OR: [{ ownerId: null }, ...(userId ? [{ ownerId: userId }] : [])] },
      orderBy: { ownerId: "desc" }
    });
    const secret = gateway?.secretRef ? process.env[gateway.secretRef] : process.env[`${key.toUpperCase().replaceAll("-", "_")}_SECRET_KEY`];
    return new OpenCheckoutGatewayAdapter(key, { baseUrl: gateway?.baseUrl ?? process.env[`${key.toUpperCase().replaceAll("-", "_")}_BASE_URL`], secret });
  }

  private webhookSecretFor(key: string) {
    return process.env[`${key.toUpperCase().replaceAll("-", "_")}_WEBHOOK_SECRET`];
  }
}

function title(plan: string) {
  return `${plan.charAt(0)}${plan.slice(1).toLowerCase()}`;
}

function normalizePlan(plan: string): SubscriptionPlan {
  const normalized = plan.toUpperCase().replace("-", "_");
  return normalized === "PRO" || normalized === "STYLIST" || normalized === "ENTERPRISE" ? normalized : "FREE";
}

function normalizeStatus(status?: string): SubscriptionStatus {
  const normalized = status?.toUpperCase().replace("-", "_");
  if (normalized === "TRIALING" || normalized === "ACTIVE" || normalized === "PAST_DUE" || normalized === "CANCELED" || normalized === "INCOMPLETE") {
    return normalized;
  }
  if (normalized === "PAID" || normalized === "COMPLETED" || normalized === "AUTHENTICATED") return "ACTIVE";
  if (normalized === "FAILED" || normalized === "PAYMENT_FAILED" || normalized === "OVERDUE") return "PAST_DUE";
  if (normalized === "CANCELLED") return "CANCELED";
  return "ACTIVE";
}

function entitlementFor(plan: SubscriptionPlan) {
  return defaultEntitlements[plan];
}

function invoiceStatus(eventType: string, status?: string) {
  const normalized = `${eventType} ${status ?? ""}`.toLowerCase();
  if (normalized.includes("paid") || normalized.includes("succeeded") || normalized.includes("completed")) return "paid";
  if (normalized.includes("failed") || normalized.includes("past_due") || normalized.includes("overdue")) return "failed";
  return "pending";
}

function isPaidInvoice(eventType: string, status?: string) {
  return invoiceStatus(eventType, status) === "paid";
}
