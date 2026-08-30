import { SubscriptionPlan } from "@prisma/client";
import type { Request, Response } from "express";
import { AuthService } from "./auth/auth.service";
import { PrismaService } from "./prisma.service";
export declare class BillingController {
    private readonly prisma;
    private readonly auth;
    constructor(prisma: PrismaService, auth: AuthService);
    plans(): {
        code: string;
        name: string;
        price: string;
        limits: string[];
        status: string;
    }[];
    current(request: Request): Promise<{
        code: string;
        name: string;
        price: string;
        status: string;
        gateway: string;
        entitlements: string | number | boolean | import("@prisma/client/runtime/library").JsonObject | import("@prisma/client/runtime/library").JsonArray | Record<import("./billing/entitlements.service").EntitlementKey, number | boolean>;
        limits: string[];
    }>;
    invoices(request: Request): Promise<{
        id: string;
        gateway: string;
        amount: string;
        status: string;
        paidAt: string;
        hostedInvoiceUrl: string | null;
        downloadUrl: string;
    }[]>;
    downloadInvoice(request: Request, id: string, response: Response): Promise<void>;
    gateways(request: Request): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.BillingGatewayStatus;
        key: string;
        ownerId: string | null;
        displayName: string;
        baseUrl: string | null;
        webhookSecretRef: string | null;
        secretRef: string | null;
        config: import("@prisma/client/runtime/library").JsonValue;
    }[]>;
    upsertGateway(request: Request, body: {
        key: string;
        displayName: string;
        baseUrl?: string;
        secretEnv?: string;
        webhookSecretEnv?: string;
        status?: "ENABLED" | "DISABLED" | "TESTING";
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.BillingGatewayStatus;
        key: string;
        ownerId: string | null;
        displayName: string;
        baseUrl: string | null;
        webhookSecretRef: string | null;
        secretRef: string | null;
        config: import("@prisma/client/runtime/library").JsonValue;
    }>;
    checkout(request: Request, body: {
        plan: SubscriptionPlan;
        gateway?: string;
        successUrl?: string;
        cancelUrl?: string;
    }): Promise<import("./billing/gateway").CheckoutSession>;
    portal(request: Request): Promise<import("./billing/gateway").BillingPortalSession>;
    webhook(gatewayKey: string, body: unknown, headers: Record<string, string | string[] | undefined>): Promise<{
        ok: boolean;
        event: import("./billing/gateway").GatewayWebhookResult;
    }>;
    private gatewayFor;
    private webhookSecretFor;
}
