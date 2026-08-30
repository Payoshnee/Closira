import { Prisma } from "@prisma/client";
import type { Request } from "express";
import { AuthService } from "./auth/auth.service";
import { PrismaService } from "./prisma.service";
type OutfitBody = {
    name?: string;
    occasion?: string;
    notes?: string;
    isFavorite?: boolean;
    itemIds?: string[];
};
export declare class OutfitsController {
    private readonly prisma;
    private readonly auth;
    constructor(prisma: PrismaService, auth: AuthService);
    list(request: Request, q?: string, occasion?: string, favorite?: string): Promise<{
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
    }[]>;
    summary(request: Request): Promise<{
        totalOutfits: number;
        favoriteOutfits: number;
        plannedThisWeek: number;
        mostUsedOccasion: string;
    }>;
    get(request: Request, id: string): Promise<{
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
    }>;
    create(request: Request, body: OutfitBody): Promise<{
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
    }>;
    update(request: Request, id: string, body: OutfitBody): Promise<{
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
    }>;
    duplicate(request: Request, id: string): Promise<{
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
    }>;
    favorite(request: Request, id: string, body: {
        isFavorite?: boolean;
    }): Promise<{
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
    }>;
}
export declare const outfitInclude: {
    items: {
        include: {
            item: {
                include: {
                    category: boolean;
                    tags: {
                        include: {
                            tag: {
                                include: {
                                    _count: {
                                        select: {
                                            items: boolean;
                                        };
                                    };
                                };
                            };
                        };
                    };
                    images: {
                        orderBy: ({
                            isPrimary: "desc";
                            createdAt?: undefined;
                        } | {
                            createdAt: "asc";
                            isPrimary?: undefined;
                        })[];
                    };
                };
            };
        };
        orderBy: {
            sortOrder: "asc";
        };
    };
    plans: {
        orderBy: {
            startsAt: "desc";
        };
        take: number;
    };
};
export type OutfitWithRelations = Prisma.OutfitGetPayload<{
    include: typeof outfitInclude;
}>;
export declare function toOutfit(outfit: OutfitWithRelations): {
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
export {};
