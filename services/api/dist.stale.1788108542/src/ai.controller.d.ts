import type { Request } from "express";
import { AuthService } from "./auth/auth.service";
import { EntitlementsService } from "./billing/entitlements.service";
import { PrismaService } from "./prisma.service";
import { StorageService } from "./storage/storage.service";
type WebProvider = "native" | "openai" | "anthropic" | "gemini" | "azure-openai" | "ollama" | "custom";
type AiProviderSettings = {
    activeProvider: WebProvider;
    nativeEnabled: boolean;
    connectedProviders: WebProvider[];
    supportedProviders: {
        id: WebProvider;
        name: string;
        requiresApiKey: boolean;
        endpointLabel?: string;
    }[];
};
export declare class AiController {
    private readonly prisma;
    private readonly auth;
    private readonly entitlements;
    private readonly storage;
    constructor(prisma: PrismaService, auth: AuthService, entitlements: EntitlementsService, storage: StorageService);
    getSettings(request: Request): Promise<AiProviderSettings>;
    updateSettings(request: Request, body: Partial<AiProviderSettings> & {
        provider?: WebProvider;
        apiKey?: string;
        baseUrl?: string;
        model?: string;
    }): Promise<AiProviderSettings>;
    recommendOutfit(request: Request, body: {
        prompt?: string;
        occasion?: string;
    }): Promise<{
        id: string;
        prompt: string;
        title: string;
        confidence: number;
        occasion: string;
        explanation: string;
        items: any[];
        provider: WebProvider;
        fallbackUsed: boolean;
    }>;
    listRecommendations(request: Request): Promise<{
        id: string;
        prompt: string;
        title: string;
        confidence: number;
        occasion: string;
        explanation: string;
        items: any[];
        provider: WebProvider;
        fallbackUsed: boolean;
    }[]>;
    shoppingCheck(request: Request, body: {
        itemName?: string;
        occasion?: string;
    }): Promise<{
        id: string;
        itemName: string;
        recommendation: string;
        compatibilityScore: number;
        duplicateRisk: string;
        explanation: string;
        similarItems: any[];
        provider: WebProvider;
        fallbackUsed: boolean;
    }>;
    listShoppingChecks(request: Request): Promise<[{
        id: string;
        itemName: string;
        recommendation: string;
        compatibilityScore: number;
        duplicateRisk: string;
        explanation: string;
        similarItems: any[];
        provider: WebProvider;
        fallbackUsed: boolean;
    }, {
        id: string;
        itemName: string;
        recommendation: string;
        compatibilityScore: number;
        duplicateRisk: string;
        explanation: string;
        similarItems: any[];
        provider: WebProvider;
        fallbackUsed: boolean;
    }]>;
    analyzeItem(request: Request, itemId: string): Promise<Record<string, unknown>>;
    embedItem(request: Request, itemId: string): Promise<{
        dimensions: number;
    }>;
    similarItems(request: Request, itemId: string): Promise<{
        item: {
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
        } | undefined;
        similarity: number;
    }[]>;
    private activeProvider;
    private userWardrobe;
    private callProviderRecommendation;
    private callProviderShopping;
    private callProviderClothingAnalysis;
    private callNativeClothingAnalysis;
    private callExternalTextProvider;
    private callExternalVisionProvider;
    private createJob;
    private finishJob;
    private applyAutoTags;
    private localStylistFallback;
    private localShoppingFallback;
}
export {};
