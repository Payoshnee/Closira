import type { Request } from "express";
import { AuthService } from "./auth/auth.service";
import { PrismaService } from "./prisma.service";
export declare class ProfileController {
    private readonly prisma;
    private readonly auth;
    constructor(prisma: PrismaService, auth: AuthService);
    getProfile(request: Request): Promise<{
        id: string;
        name: string;
        email: string;
        phone: string;
        stylePreferences: string[];
        favoriteColors: string[];
        privacyMode: "standard" | "strict";
        notificationsEnabled: boolean;
    }>;
    updateProfile(request: Request, body: {
        name?: string;
        email?: string;
        phone?: string;
        privacyMode?: "standard" | "strict";
        notificationsEnabled?: boolean;
        stylePreferences?: string[];
        favoriteColors?: string[];
    }): Promise<{
        id: string;
        name: string;
        email: string;
        phone: string;
        stylePreferences: string[];
        favoriteColors: string[];
        privacyMode: "standard" | "strict";
        notificationsEnabled: boolean;
    }>;
}
