import type { Request } from "express";
import { AuthService } from "./auth/auth.service";
import { EntitlementsService } from "./billing/entitlements.service";
import { PrismaService } from "./prisma.service";
import { ImageProcessingService } from "./storage/image-processing.service";
import { StorageService } from "./storage/storage.service";
type WardrobeBody = {
    title?: string;
    name?: string;
    categoryId?: string;
    primaryColor?: string;
    color?: string;
    secondaryColors?: string[];
    material?: string;
    pattern?: string;
    brand?: string;
    purchasePrice?: number;
    currency?: string;
    size?: string;
    season?: string | string[];
    occasions?: string[];
    notes?: string;
    isFavorite?: boolean;
    tagIds?: string[];
};
export declare class WardrobeController {
    private readonly prisma;
    private readonly auth;
    private readonly storage;
    private readonly imageProcessing;
    private readonly entitlements;
    constructor(prisma: PrismaService, auth: AuthService, storage: StorageService, imageProcessing: ImageProcessingService, entitlements: EntitlementsService);
    listItems(request: Request, q?: string, categoryId?: string, tagId?: string, favorite?: string, neverWorn?: string, sort?: string, page?: string, pageSize?: string): Promise<{
        items: {
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
        }[];
        total: number;
        page: number;
        pageSize: number;
    }>;
    summary(request: Request): Promise<{
        totalItems: number;
        favoriteItems: number;
        neverWornItems: number;
        totalValue: number;
        mostUsedCategory: string;
    }>;
    getItem(request: Request, id: string): Promise<{
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
    }>;
    createItem(request: Request, body: WardrobeBody): Promise<{
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
    }>;
    updateItem(request: Request, id: string, body: WardrobeBody): Promise<{
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
    }>;
    toggleFavorite(request: Request, id: string, body: {
        isFavorite?: boolean;
    }): Promise<{
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
    }>;
    markWorn(request: Request, id: string, body: {
        wornAt?: string;
        context?: string;
        notes?: string;
    }): Promise<{
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
    }>;
    createUploadUrl(request: Request, id: string, body: {
        fileName: string;
        contentType: string;
        byteSize: number;
    }): Promise<{
        imageId: string;
        storageKey: string;
        uploadUrl: string;
        publicUrl: string;
        expiresInSeconds: number;
        headers: Record<string, string>;
    }>;
    completeImageUpload(request: Request, id: string, imageId: string): Promise<{
        imageId: string;
        status: string;
        width: number | null;
        height: number | null;
        byteSize: number;
        variants: Record<"thumbnail" | "card" | "detail", {
            key: string;
            width: number;
            height: number;
            byteSize: number;
            contentType: string;
        }>;
        readUrl: string;
        expiresInSeconds: number;
    }>;
    createImageReadUrl(request: Request, id: string, imageId: string): Promise<import("./storage/storage.service").SignedRead>;
    setPrimaryImage(request: Request, id: string, imageId: string): Promise<{
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
    }>;
    deleteImage(request: Request, id: string, imageId: string): Promise<{
        ok: boolean;
    }>;
    archiveItem(request: Request, id: string): Promise<{
        ok: boolean;
    }>;
    private createItemData;
    private updateItemData;
    private orderBy;
}
export {};
