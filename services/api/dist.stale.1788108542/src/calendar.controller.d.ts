import type { Request } from "express";
import { AuthService } from "./auth/auth.service";
import { PrismaService } from "./prisma.service";
type CalendarBody = {
    outfitId: string;
    eventName?: string;
    eventType?: string;
    startsAt: string;
    endsAt?: string;
    location?: string;
    notes?: string;
};
export declare class CalendarController {
    private readonly prisma;
    private readonly auth;
    constructor(prisma: PrismaService, auth: AuthService);
    list(request: Request): Promise<{
        id: string;
        outfitId: string;
        outfit: {
            id: string;
            name: string;
            occasion: string;
            notes: string;
            isFavorite: boolean;
            usageCount: number;
            lastWornAt: string | null;
            items: {
                id: string;
                slot: string;
                sortOrder: number;
                wardrobeItem: {
                    id: string;
                    title: string;
                    categoryId: string;
                    categoryName: string;
                    primaryColor: string;
                    secondaryColors: string[];
                    material: string;
                    pattern: string;
                    brand: string;
                    purchasePrice: number;
                    currency: string;
                    size: string;
                    condition: string;
                    season: string;
                    usageCount: number;
                    lastWornAt: string | null;
                    storageLocation: string;
                    notes: string;
                    isFavorite: boolean;
                    tags: {
                        id: string;
                        type: string;
                        name: string;
                        slug: string;
                        itemCount: number;
                        isDefault: boolean;
                    }[];
                    images: {
                        id: string;
                        imageType: string;
                        alt: string;
                        gradient: string;
                        url: string | null;
                        isPrimary: boolean;
                    }[];
                };
            }[];
        };
        eventName: string;
        eventType: string;
        startsAt: string;
        endsAt: string;
        location: string;
        notes: string;
        conflictStatus: "none" | "warning";
        reminderStatus: string;
    }[]>;
    summary(request: Request): Promise<{
        plannedOutfits: number;
        conflictWarnings: number;
        nextEventName: string;
        nextEventDate: string;
    }>;
    create(request: Request, body: CalendarBody): Promise<{
        id: string;
        outfitId: string;
        outfit: {
            id: string;
            name: string;
            occasion: string;
            notes: string;
            isFavorite: boolean;
            usageCount: number;
            lastWornAt: string | null;
            items: {
                id: string;
                slot: string;
                sortOrder: number;
                wardrobeItem: {
                    id: string;
                    title: string;
                    categoryId: string;
                    categoryName: string;
                    primaryColor: string;
                    secondaryColors: string[];
                    material: string;
                    pattern: string;
                    brand: string;
                    purchasePrice: number;
                    currency: string;
                    size: string;
                    condition: string;
                    season: string;
                    usageCount: number;
                    lastWornAt: string | null;
                    storageLocation: string;
                    notes: string;
                    isFavorite: boolean;
                    tags: {
                        id: string;
                        type: string;
                        name: string;
                        slug: string;
                        itemCount: number;
                        isDefault: boolean;
                    }[];
                    images: {
                        id: string;
                        imageType: string;
                        alt: string;
                        gradient: string;
                        url: string | null;
                        isPrimary: boolean;
                    }[];
                };
            }[];
        };
        eventName: string;
        eventType: string;
        startsAt: string;
        endsAt: string;
        location: string;
        notes: string;
        conflictStatus: "none" | "warning";
        reminderStatus: string;
    }>;
    markWorn(request: Request, id: string): Promise<{
        ok: boolean;
    }>;
}
export {};
