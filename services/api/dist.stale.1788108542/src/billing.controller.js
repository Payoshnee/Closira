"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillingController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth/auth.service");
const current_user_1 = require("./auth/current-user");
const gateways_1 = require("./billing/gateways");
const gateway_1 = require("./billing/gateway");
const entitlements_service_1 = require("./billing/entitlements.service");
const prisma_service_1 = require("./prisma.service");
let BillingController = class BillingController {
    prisma;
    auth;
    constructor(prisma, auth) {
        this.prisma = prisma;
        this.auth = auth;
    }
    plans() {
        return Object.entries(gateway_1.planPrices).map(([code, plan]) => ({ code, name: title(code), price: plan.label, limits: plan.limits, status: "active" }));
    }
    async current(request) {
        const user = (0, current_user_1.requireCurrentUser)(request, this.auth);
        const subscription = await this.prisma.subscription.findFirst({
            where: { userId: user.id },
            orderBy: { createdAt: "desc" }
        });
        const planCode = subscription?.plan ?? "FREE";
        const plan = gateway_1.planPrices[planCode];
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
    async invoices(request) {
        const user = (0, current_user_1.requireCurrentUser)(request, this.auth);
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
    async downloadInvoice(request, id, response) {
        const user = (0, current_user_1.requireCurrentUser)(request, this.auth);
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
    async gateways(request) {
        const user = (0, current_user_1.requireCurrentUser)(request, this.auth);
        return this.prisma.billingGateway.findMany({
            where: { OR: [{ ownerId: null }, { ownerId: user.id }] },
            orderBy: [{ status: "asc" }, { displayName: "asc" }]
        });
    }
    async upsertGateway(request, body) {
        const user = (0, current_user_1.requireCurrentUser)(request, this.auth);
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
    async checkout(request, body) {
        const user = (0, current_user_1.requireCurrentUser)(request, this.auth);
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
    async portal(request) {
        const user = (0, current_user_1.requireCurrentUser)(request, this.auth);
        const subscription = await this.prisma.subscription.findFirstOrThrow({ where: { userId: user.id }, orderBy: { createdAt: "desc" } });
        const gateway = await this.gatewayFor(user.id, subscription.providerKey);
        return gateway.createPortal(subscription.stripeCustomerId ?? `manual_customer_${user.id}`);
    }
    async webhook(gatewayKey, body, headers) {
        const gateway = await this.gatewayFor(null, gatewayKey);
        (0, entitlements_service_1.verifyGatewaySignature)(body, headers, this.webhookSecretFor(gatewayKey));
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
    async gatewayFor(userId, key) {
        if (key === "manual")
            return new gateways_1.ManualGatewayAdapter();
        const gateway = await this.prisma.billingGateway.findFirst({
            where: { key, OR: [{ ownerId: null }, ...(userId ? [{ ownerId: userId }] : [])] },
            orderBy: { ownerId: "desc" }
        });
        const secret = gateway?.secretRef ? process.env[gateway.secretRef] : process.env[`${key.toUpperCase().replaceAll("-", "_")}_SECRET_KEY`];
        return new gateways_1.OpenCheckoutGatewayAdapter(key, { baseUrl: gateway?.baseUrl ?? process.env[`${key.toUpperCase().replaceAll("-", "_")}_BASE_URL`], secret });
    }
    webhookSecretFor(key) {
        return process.env[`${key.toUpperCase().replaceAll("-", "_")}_WEBHOOK_SECRET`];
    }
};
exports.BillingController = BillingController;
__decorate([
    (0, common_1.Get)("plans"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], BillingController.prototype, "plans", null);
__decorate([
    (0, common_1.Get)("current"),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "current", null);
__decorate([
    (0, common_1.Get)("invoices"),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "invoices", null);
__decorate([
    (0, common_1.Get)("invoices/:id/download"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("id")),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "downloadInvoice", null);
__decorate([
    (0, common_1.Get)("gateways"),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "gateways", null);
__decorate([
    (0, common_1.Post)("gateways"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "upsertGateway", null);
__decorate([
    (0, common_1.Post)("checkout"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "checkout", null);
__decorate([
    (0, common_1.Post)("portal"),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "portal", null);
__decorate([
    (0, common_1.Post)("webhooks/:gateway"),
    __param(0, (0, common_1.Param)("gateway")),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Headers)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "webhook", null);
exports.BillingController = BillingController = __decorate([
    (0, common_1.Controller)("billing"),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        auth_service_1.AuthService])
], BillingController);
function title(plan) {
    return `${plan.charAt(0)}${plan.slice(1).toLowerCase()}`;
}
function normalizePlan(plan) {
    const normalized = plan.toUpperCase().replace("-", "_");
    return normalized === "PRO" || normalized === "STYLIST" || normalized === "ENTERPRISE" ? normalized : "FREE";
}
function normalizeStatus(status) {
    const normalized = status?.toUpperCase().replace("-", "_");
    if (normalized === "TRIALING" || normalized === "ACTIVE" || normalized === "PAST_DUE" || normalized === "CANCELED" || normalized === "INCOMPLETE") {
        return normalized;
    }
    if (normalized === "PAID" || normalized === "COMPLETED" || normalized === "AUTHENTICATED")
        return "ACTIVE";
    if (normalized === "FAILED" || normalized === "PAYMENT_FAILED" || normalized === "OVERDUE")
        return "PAST_DUE";
    if (normalized === "CANCELLED")
        return "CANCELED";
    return "ACTIVE";
}
function entitlementFor(plan) {
    return entitlements_service_1.defaultEntitlements[plan];
}
function invoiceStatus(eventType, status) {
    const normalized = `${eventType} ${status ?? ""}`.toLowerCase();
    if (normalized.includes("paid") || normalized.includes("succeeded") || normalized.includes("completed"))
        return "paid";
    if (normalized.includes("failed") || normalized.includes("past_due") || normalized.includes("overdue"))
        return "failed";
    return "pending";
}
function isPaidInvoice(eventType, status) {
    return invoiceStatus(eventType, status) === "paid";
}
//# sourceMappingURL=billing.controller.js.map