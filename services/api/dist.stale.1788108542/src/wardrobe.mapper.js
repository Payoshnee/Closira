"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.itemInclude = void 0;
exports.toWardrobeItem = toWardrobeItem;
exports.itemInclude = {
    category: true,
    tags: { include: { tag: { include: { _count: { select: { items: true } } } } } },
    images: { orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }] }
};
function toWardrobeItem(item) {
    return {
        id: item.id,
        title: item.name,
        categoryId: item.categoryId ?? "",
        categoryName: item.category?.name ?? "Uncategorized",
        primaryColor: item.color ?? "Unknown",
        secondaryColors: item.secondaryColors,
        material: item.material ?? "",
        pattern: item.pattern ?? "",
        brand: item.brand ?? "",
        purchasePrice: Number(item.purchasePrice ?? 0),
        currency: item.purchaseCurrency ?? "USD",
        size: item.size ?? "",
        condition: item.metadata?.condition ?? "excellent",
        season: item.season[0] ?? "all-season",
        usageCount: item.wearCount,
        lastWornAt: item.lastWornAt?.toISOString() ?? null,
        storageLocation: item.metadata?.storageLocation ?? "",
        notes: item.notes ?? "",
        isFavorite: item.isFavorite,
        tags: item.tags.map(({ tag }) => ({
            id: tag.id,
            type: "custom",
            name: tag.name,
            slug: tag.slug,
            itemCount: tag._count.items,
            isDefault: false
        })),
        images: item.images.map((image) => ({
            id: image.id,
            imageType: "front",
            alt: image.altText ?? item.name,
            gradient: "from-ivory-100 via-white to-sage/50",
            url: image.url,
            isPrimary: image.isPrimary
        }))
    };
}
//# sourceMappingURL=wardrobe.mapper.js.map