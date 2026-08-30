"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WardrobeController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth/auth.service");
const entitlements_service_1 = require("./billing/entitlements.service");
const current_user_1 = require("./auth/current-user");
const prisma_service_1 = require("./prisma.service");
const image_processing_service_1 = require("./storage/image-processing.service");
const storage_service_1 = require("./storage/storage.service");
const wardrobe_mapper_1 = require("./wardrobe.mapper");
let WardrobeController = class WardrobeController {
    prisma;
    auth;
    storage;
    imageProcessing;
    entitlements;
    constructor(prisma, auth, storage, imageProcessing, entitlements) {
        this.prisma = prisma;
        this.auth = auth;
        this.storage = storage;
        this.imageProcessing = imageProcessing;
        this.entitlements = entitlements;
    }
    async listItems(request, q, categoryId, tagId, favorite, neverWorn, sort = "updatedAt_desc", page = "1", pageSize = "24") {
        const user = (0, current_user_1.requireCurrentUser)(request, this.auth);
        const take = Math.min(Math.max(Number(pageSize) || 24, 1), 100);
        const skip = (Math.max(Number(page) || 1, 1) - 1) * take;
        const where = {
            userId: user.id,
            status: "ACTIVE",
            categoryId: categoryId || undefined,
            isFavorite: favorite === "true" ? true : undefined,
            wearCount: neverWorn === "true" ? 0 : undefined,
            tags: tagId ? { some: { tagId } } : undefined,
            OR: q
                ? [
                    { name: { contains: q, mode: "insensitive" } },
                    { brand: { contains: q, mode: "insensitive" } },
                    { color: { contains: q, mode: "insensitive" } },
                    { material: { contains: q, mode: "insensitive" } }
                ]
                : undefined
        };
        const [items, total] = await this.prisma.$transaction([
            this.prisma.wardrobeItem.findMany({
                where,
                include: wardrobe_mapper_1.itemInclude,
                orderBy: this.orderBy(sort),
                skip,
                take
            }),
            this.prisma.wardrobeItem.count({ where })
        ]);
        return { items: items.map(wardrobe_mapper_1.toWardrobeItem), total, page: Number(page), pageSize: take };
    }
    async summary(request) {
        const user = (0, current_user_1.requireCurrentUser)(request, this.auth);
        const [totalItems, favoriteItems, neverWornItems, valueRows, categories] = await this.prisma.$transaction([
            this.prisma.wardrobeItem.count({ where: { userId: user.id, status: "ACTIVE" } }),
            this.prisma.wardrobeItem.count({ where: { userId: user.id, status: "ACTIVE", isFavorite: true } }),
            this.prisma.wardrobeItem.count({ where: { userId: user.id, status: "ACTIVE", wearCount: 0 } }),
            this.prisma.wardrobeItem.aggregate({
                where: { userId: user.id, status: "ACTIVE" },
                _sum: { purchasePrice: true }
            }),
            this.prisma.category.findMany({
                where: { userId: user.id },
                include: { _count: { select: { items: true } } },
                orderBy: { name: "asc" }
            })
        ]);
        const mostUsedCategory = categories.sort((a, b) => b._count.items - a._count.items)[0]?.name ?? "None";
        return {
            totalItems,
            favoriteItems,
            neverWornItems,
            totalValue: Number(valueRows._sum.purchasePrice ?? 0),
            mostUsedCategory
        };
    }
    async getItem(request, id) {
        const user = (0, current_user_1.requireCurrentUser)(request, this.auth);
        const item = await this.prisma.wardrobeItem.findFirstOrThrow({
            where: { id, userId: user.id, status: "ACTIVE" },
            include: wardrobe_mapper_1.itemInclude
        });
        return (0, wardrobe_mapper_1.toWardrobeItem)(item);
    }
    async createItem(request, body) {
        const user = (0, current_user_1.requireCurrentUser)(request, this.auth);
        await this.entitlements.requireWardrobeItemSlot(user.id);
        const item = await this.prisma.wardrobeItem.create({
            data: {
                ...this.createItemData(user.id, body),
                tags: body.tagIds ? { create: body.tagIds.map((tagId) => ({ tagId })) } : undefined
            },
            include: wardrobe_mapper_1.itemInclude
        });
        return (0, wardrobe_mapper_1.toWardrobeItem)(item);
    }
    async updateItem(request, id, body) {
        const user = (0, current_user_1.requireCurrentUser)(request, this.auth);
        const item = await this.prisma.$transaction(async (tx) => {
            if (body.tagIds) {
                await tx.wardrobeTag.deleteMany({ where: { itemId: id, item: { userId: user.id } } });
                await tx.wardrobeTag.createMany({ data: body.tagIds.map((tagId) => ({ itemId: id, tagId })) });
            }
            return tx.wardrobeItem.update({
                where: { id, userId: user.id },
                data: this.updateItemData(body),
                include: wardrobe_mapper_1.itemInclude
            });
        });
        return (0, wardrobe_mapper_1.toWardrobeItem)(item);
    }
    async toggleFavorite(request, id, body) {
        const user = (0, current_user_1.requireCurrentUser)(request, this.auth);
        const current = await this.prisma.wardrobeItem.findFirstOrThrow({ where: { id, userId: user.id } });
        const item = await this.prisma.wardrobeItem.update({
            where: { id, userId: user.id },
            data: { isFavorite: body.isFavorite ?? !current.isFavorite },
            include: wardrobe_mapper_1.itemInclude
        });
        return (0, wardrobe_mapper_1.toWardrobeItem)(item);
    }
    async markWorn(request, id, body) {
        const user = (0, current_user_1.requireCurrentUser)(request, this.auth);
        const wornAt = body.wornAt ? new Date(body.wornAt) : new Date();
        const item = await this.prisma.$transaction(async (tx) => {
            await tx.wardrobeUsageLog.create({
                data: { userId: user.id, itemId: id, wornAt, context: body.context, notes: body.notes }
            });
            return tx.wardrobeItem.update({
                where: { id, userId: user.id },
                data: { lastWornAt: wornAt, wearCount: { increment: 1 } },
                include: wardrobe_mapper_1.itemInclude
            });
        });
        return (0, wardrobe_mapper_1.toWardrobeItem)(item);
    }
    async createUploadUrl(request, id, body) {
        const user = (0, current_user_1.requireCurrentUser)(request, this.auth);
        await this.prisma.wardrobeItem.findFirstOrThrow({ where: { id, userId: user.id } });
        validateImageUpload(body);
        await this.entitlements.requireStorageBytes(user.id, body.byteSize);
        const safeName = body.fileName.replace(/[^a-zA-Z0-9._-]/g, "-");
        const storageKey = `users/${user.id}/wardrobe/${id}/${Date.now()}-${safeName}`;
        const signedUpload = await this.storage.createSignedUpload({
            key: storageKey,
            contentType: body.contentType,
            byteSize: body.byteSize
        });
        const image = await this.prisma.wardrobeImage.create({
            data: {
                itemId: id,
                storageKey: signedUpload.storageKey,
                provider: signedUpload.provider,
                url: signedUpload.publicUrl,
                contentType: body.contentType,
                byteSize: body.byteSize,
                altText: safeName,
                isPrimary: false
            }
        });
        return {
            imageId: image.id,
            storageKey: signedUpload.storageKey,
            uploadUrl: signedUpload.uploadUrl,
            publicUrl: signedUpload.publicUrl,
            expiresInSeconds: signedUpload.expiresInSeconds,
            headers: signedUpload.headers ?? {}
        };
    }
    async completeImageUpload(request, id, imageId) {
        const user = (0, current_user_1.requireCurrentUser)(request, this.auth);
        await this.prisma.wardrobeItem.findFirstOrThrow({ where: { id, userId: user.id } });
        const image = await this.prisma.wardrobeImage.findFirstOrThrow({ where: { id: imageId, itemId: id } });
        const processed = await this.imageProcessing.processImageVariants(image.storageKey, image.provider);
        const updated = await this.prisma.wardrobeImage.update({
            where: { id: imageId },
            data: {
                storageKey: processed.variants.detail.key,
                url: "",
                contentType: "image/webp",
                byteSize: processed.variants.detail.byteSize,
                width: processed.variants.detail.width,
                height: processed.variants.detail.height,
                analysis: {
                    ...jsonObject(image.analysis),
                    processedAt: new Date().toISOString(),
                    originalStorageKey: image.storageKey,
                    original: processed.original,
                    variants: processed.variants
                }
            }
        });
        const read = await this.storage.createSignedRead(updated.storageKey, updated.provider);
        return {
            imageId,
            status: "processed",
            width: updated.width,
            height: updated.height,
            byteSize: updated.byteSize,
            variants: processed.variants,
            readUrl: read.url,
            expiresInSeconds: read.expiresInSeconds
        };
    }
    async createImageReadUrl(request, id, imageId) {
        const user = (0, current_user_1.requireCurrentUser)(request, this.auth);
        await this.prisma.wardrobeItem.findFirstOrThrow({ where: { id, userId: user.id } });
        const image = await this.prisma.wardrobeImage.findFirstOrThrow({ where: { id: imageId, itemId: id } });
        return this.storage.createSignedRead(image.storageKey, image.provider);
    }
    async setPrimaryImage(request, id, imageId) {
        const user = (0, current_user_1.requireCurrentUser)(request, this.auth);
        await this.prisma.wardrobeItem.findFirstOrThrow({ where: { id, userId: user.id } });
        await this.prisma.$transaction([
            this.prisma.wardrobeImage.updateMany({ where: { itemId: id }, data: { isPrimary: false } }),
            this.prisma.wardrobeImage.update({ where: { id: imageId, itemId: id }, data: { isPrimary: true } })
        ]);
        const item = await this.prisma.wardrobeItem.findFirstOrThrow({
            where: { id, userId: user.id },
            include: wardrobe_mapper_1.itemInclude
        });
        return (0, wardrobe_mapper_1.toWardrobeItem)(item);
    }
    async deleteImage(request, id, imageId) {
        const user = (0, current_user_1.requireCurrentUser)(request, this.auth);
        await this.prisma.wardrobeItem.findFirstOrThrow({ where: { id, userId: user.id } });
        const image = await this.prisma.wardrobeImage.findFirstOrThrow({ where: { id: imageId, itemId: id } });
        await this.prisma.$transaction([
            this.prisma.imageEmbedding.deleteMany({ where: { imageId } }),
            this.prisma.wardrobeImage.delete({ where: { id: imageId } })
        ]);
        for (const key of imageStorageKeys(image)) {
            await this.storage.deleteObject(key, image.provider);
        }
        if (image.isPrimary) {
            const nextImage = await this.prisma.wardrobeImage.findFirst({
                where: { itemId: id },
                orderBy: { createdAt: "asc" }
            });
            if (nextImage) {
                await this.prisma.wardrobeImage.update({ where: { id: nextImage.id }, data: { isPrimary: true } });
            }
        }
        return { ok: true };
    }
    async archiveItem(request, id) {
        const user = (0, current_user_1.requireCurrentUser)(request, this.auth);
        await this.prisma.wardrobeItem.update({ where: { id, userId: user.id }, data: { status: "ARCHIVED" } });
        return { ok: true };
    }
    createItemData(userId, body) {
        const season = Array.isArray(body.season) ? body.season : body.season ? [body.season] : undefined;
        return {
            userId,
            name: body.title ?? body.name ?? "Untitled item",
            categoryId: body.categoryId,
            color: body.primaryColor ?? body.color,
            secondaryColors: body.secondaryColors,
            material: body.material,
            pattern: body.pattern,
            brand: body.brand,
            purchasePrice: body.purchasePrice,
            purchaseCurrency: body.currency,
            size: body.size,
            season,
            occasions: body.occasions,
            notes: body.notes,
            isFavorite: body.isFavorite
        };
    }
    updateItemData(body) {
        const season = Array.isArray(body.season) ? body.season : body.season ? [body.season] : undefined;
        return {
            name: body.title ?? body.name,
            categoryId: body.categoryId,
            color: body.primaryColor ?? body.color,
            secondaryColors: body.secondaryColors,
            material: body.material,
            pattern: body.pattern,
            brand: body.brand,
            purchasePrice: body.purchasePrice,
            purchaseCurrency: body.currency,
            size: body.size,
            season,
            occasions: body.occasions,
            notes: body.notes,
            isFavorite: body.isFavorite
        };
    }
    orderBy(sort) {
        if (sort === "name_asc")
            return { name: "asc" };
        if (sort === "wearCount_desc")
            return { wearCount: "desc" };
        if (sort === "lastWornAt_desc")
            return { lastWornAt: "desc" };
        return { updatedAt: "desc" };
    }
};
exports.WardrobeController = WardrobeController;
__decorate([
    (0, common_1.Get)("items"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)("q")),
    __param(2, (0, common_1.Query)("categoryId")),
    __param(3, (0, common_1.Query)("tagId")),
    __param(4, (0, common_1.Query)("favorite")),
    __param(5, (0, common_1.Query)("neverWorn")),
    __param(6, (0, common_1.Query)("sort")),
    __param(7, (0, common_1.Query)("page")),
    __param(8, (0, common_1.Query)("pageSize")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, String, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], WardrobeController.prototype, "listItems", null);
__decorate([
    (0, common_1.Get)("summary"),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WardrobeController.prototype, "summary", null);
__decorate([
    (0, common_1.Get)("items/:id"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], WardrobeController.prototype, "getItem", null);
__decorate([
    (0, common_1.Post)("items"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], WardrobeController.prototype, "createItem", null);
__decorate([
    (0, common_1.Patch)("items/:id"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("id")),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], WardrobeController.prototype, "updateItem", null);
__decorate([
    (0, common_1.Patch)("items/:id/favorite"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("id")),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], WardrobeController.prototype, "toggleFavorite", null);
__decorate([
    (0, common_1.Post)("items/:id/mark-worn"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("id")),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], WardrobeController.prototype, "markWorn", null);
__decorate([
    (0, common_1.Post)("items/:id/upload-url"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("id")),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], WardrobeController.prototype, "createUploadUrl", null);
__decorate([
    (0, common_1.Post)("items/:id/images/:imageId/complete"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("id")),
    __param(2, (0, common_1.Param)("imageId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], WardrobeController.prototype, "completeImageUpload", null);
__decorate([
    (0, common_1.Get)("items/:id/images/:imageId/read-url"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("id")),
    __param(2, (0, common_1.Param)("imageId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], WardrobeController.prototype, "createImageReadUrl", null);
__decorate([
    (0, common_1.Patch)("items/:id/images/:imageId/primary"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("id")),
    __param(2, (0, common_1.Param)("imageId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], WardrobeController.prototype, "setPrimaryImage", null);
__decorate([
    (0, common_1.Delete)("items/:id/images/:imageId"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("id")),
    __param(2, (0, common_1.Param)("imageId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], WardrobeController.prototype, "deleteImage", null);
__decorate([
    (0, common_1.Patch)("items/:id/archive"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], WardrobeController.prototype, "archiveItem", null);
exports.WardrobeController = WardrobeController = __decorate([
    (0, common_1.Controller)("wardrobe"),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        auth_service_1.AuthService,
        storage_service_1.StorageService,
        image_processing_service_1.ImageProcessingService,
        entitlements_service_1.EntitlementsService])
], WardrobeController);
function validateImageUpload(body) {
    const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"]);
    const maxBytes = Number(process.env.IMAGE_UPLOAD_MAX_BYTES ?? 10 * 1024 * 1024);
    if (!body.fileName || !body.contentType || !allowedTypes.has(body.contentType)) {
        throw new common_1.BadRequestException("Only JPEG, PNG, WebP, HEIC, and HEIF wardrobe images are supported.");
    }
    if (!Number.isFinite(body.byteSize) || body.byteSize <= 0 || body.byteSize > maxBytes) {
        throw new common_1.BadRequestException(`Image must be smaller than ${Math.round(maxBytes / 1024 / 1024)}MB.`);
    }
}
function jsonObject(value) {
    return typeof value === "object" && value && !Array.isArray(value) ? value : {};
}
function imageStorageKeys(image) {
    const keys = new Set([image.storageKey]);
    const analysis = jsonObject(image.analysis);
    if (analysis.original?.key) {
        keys.add(analysis.original.key);
    }
    for (const variant of Object.values(analysis.variants ?? {})) {
        if (variant.key) {
            keys.add(variant.key);
        }
    }
    return [...keys];
}
//# sourceMappingURL=wardrobe.controller.js.map