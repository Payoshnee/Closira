import { AiProviderType, Prisma, SubscriptionPlan } from "@prisma/client";
import { PrismaService } from "../prisma.service";
export type EntitlementKey = "wardrobeItems" | "aiRequestsPerMonth" | "customProviders" | "storageBytes";
export declare const defaultEntitlements: Record<SubscriptionPlan, Record<EntitlementKey, number | boolean>>;
export declare class EntitlementsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    current(userId: string): Promise<{
        plan: import(".prisma/client").$Enums.SubscriptionPlan;
        subscription: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            status: import(".prisma/client").$Enums.SubscriptionStatus;
            provider: import(".prisma/client").$Enums.BillingProvider;
            plan: import(".prisma/client").$Enums.SubscriptionPlan;
            providerKey: string;
            stripeCustomerId: string | null;
            stripeSubscriptionId: string | null;
            currentPeriodStart: Date | null;
            currentPeriodEnd: Date | null;
            cancelAtPeriodEnd: boolean;
            entitlements: Prisma.JsonValue;
        } | null;
        limits: {
            wardrobeItems: number | boolean;
            aiRequestsPerMonth: number | boolean;
            customProviders: number | boolean;
            storageBytes: number | boolean;
        };
    }>;
    requireWardrobeItemSlot(userId: string): Promise<void>;
    requireStorageBytes(userId: string, nextUploadBytes: number): Promise<void>;
    requireAiRequest(userId: string): Promise<void>;
    requireProvider(userId: string, provider: AiProviderType): Promise<void>;
}
export declare function verifyGatewaySignature(rawBody: unknown, headers: Record<string, string | string[] | undefined>, secret?: string): void;
