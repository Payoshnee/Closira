import { Prisma } from "@prisma/client";
export declare const itemInclude: {
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
export type ItemWithRelations = Prisma.WardrobeItemGetPayload<{
    include: typeof itemInclude;
}>;
export declare function toWardrobeItem(item: ItemWithRelations): {
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
