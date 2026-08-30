import { UserRole } from "@prisma/client";
import type { Request } from "express";
import { AuthService } from "./auth/auth.service";
import { PrismaService } from "./prisma.service";
export declare class AdminController {
    private readonly prisma;
    private readonly auth;
    constructor(prisma: PrismaService, auth: AuthService);
    metrics(request: Request): Promise<{
        label: string;
        value: string;
        detail: string;
    }[]>;
    health(request: Request): Promise<{
        service: string;
        status: string;
        detail: string;
    }[]>;
    users(request: Request, q?: string): Promise<{
        id: string;
        name: string;
        email: string;
        role: import(".prisma/client").$Enums.UserRole;
        emailVerified: boolean;
        wardrobeItems: number;
        outfits: number;
        aiJobs: number;
        plan: import(".prisma/client").$Enums.SubscriptionPlan;
        createdAt: string;
    }[]>;
    updateRole(request: Request, id: string, body: {
        role: UserRole;
    }): Promise<{
        id: string;
        role: import(".prisma/client").$Enums.UserRole;
    }>;
    aiJobs(request: Request): Promise<{
        id: string;
        user: string;
        type: import(".prisma/client").$Enums.AiJobType;
        provider: import(".prisma/client").$Enums.AiProviderType;
        status: import(".prisma/client").$Enums.AiJobStatus;
        confidence: number;
        errorMessage: string | null;
        createdAt: string;
    }[]>;
    storage(request: Request): Promise<{
        provider: import(".prisma/client").$Enums.StorageProvider;
        images: number;
        bytes: number;
        displayBytes: string;
    }[]>;
    reports(request: Request): Promise<{
        period: string;
        newUsers: number;
        wardrobeUsageLogs: number;
        revenue: number;
    }>;
    auditLogs(request: Request): Promise<{
        id: string;
        actor: string;
        action: string;
        entity: string;
        entityId: string | null;
        createdAt: string;
    }[]>;
}
