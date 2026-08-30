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
exports.outfitInclude = exports.OutfitsController = void 0;
exports.toOutfit = toOutfit;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const auth_service_1 = require("./auth/auth.service");
const current_user_1 = require("./auth/current-user");
const prisma_service_1 = require("./prisma.service");
const wardrobe_mapper_1 = require("./wardrobe.mapper");
let OutfitsController = class OutfitsController {
    prisma;
    auth;
    constructor(prisma, auth) {
        this.prisma = prisma;
        this.auth = auth;
    }
    async list(request, q, occasion, favorite) {
        const user = (0, current_user_1.requireCurrentUser)(request, this.auth);
        const outfits = await this.prisma.outfit.findMany({
            where: {
                userId: user.id,
                occasion: occasion || undefined,
                isFavorite: favorite === "true" ? true : undefined,
                OR: q ? [{ name: { contains: q, mode: "insensitive" } }, { description: { contains: q, mode: "insensitive" } }] : undefined
            },
            include: exports.outfitInclude,
            orderBy: { updatedAt: "desc" }
        });
        return outfits.map(toOutfit);
    }
    async summary(request) {
        const user = (0, current_user_1.requireCurrentUser)(request, this.auth);
        const weekStart = new Date();
        const weekEnd = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        const [totalOutfits, favoriteOutfits, plannedThisWeek, outfits] = await this.prisma.$transaction([
            this.prisma.outfit.count({ where: { userId: user.id } }),
            this.prisma.outfit.count({ where: { userId: user.id, isFavorite: true } }),
            this.prisma.calendarPlan.count({ where: { userId: user.id, startsAt: { gte: weekStart, lte: weekEnd } } }),
            this.prisma.outfit.findMany({ where: { userId: user.id }, select: { occasion: true } })
        ]);
        const counts = outfits.reduce((acc, outfit) => {
            const key = outfit.occasion ?? "General";
            acc[key] = (acc[key] ?? 0) + 1;
            return acc;
        }, {});
        const mostUsedOccasion = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "None";
        return { totalOutfits, favoriteOutfits, plannedThisWeek, mostUsedOccasion };
    }
    async get(request, id) {
        const user = (0, current_user_1.requireCurrentUser)(request, this.auth);
        const outfit = await this.prisma.outfit.findFirstOrThrow({ where: { id, userId: user.id }, include: exports.outfitInclude });
        return toOutfit(outfit);
    }
    async create(request, body) {
        const user = (0, current_user_1.requireCurrentUser)(request, this.auth);
        const outfit = await this.prisma.outfit.create({
            data: {
                userId: user.id,
                name: body.name?.trim() || "Untitled outfit",
                occasion: body.occasion?.trim(),
                description: body.notes,
                items: body.itemIds ? { create: body.itemIds.filter(Boolean).map((itemId, index) => ({ itemId, slot: slotForIndex(index), sortOrder: index })) } : undefined
            },
            include: exports.outfitInclude
        });
        return toOutfit(outfit);
    }
    async update(request, id, body) {
        const user = (0, current_user_1.requireCurrentUser)(request, this.auth);
        const outfit = await this.prisma.$transaction(async (tx) => {
            if (body.itemIds) {
                await tx.outfitItem.deleteMany({ where: { outfitId: id, outfit: { userId: user.id } } });
                await tx.outfitItem.createMany({
                    data: body.itemIds.filter(Boolean).map((itemId, index) => ({ outfitId: id, itemId, slot: slotForIndex(index), sortOrder: index }))
                });
            }
            return tx.outfit.update({
                where: { id, userId: user.id },
                data: { name: body.name, occasion: body.occasion, description: body.notes, isFavorite: body.isFavorite },
                include: exports.outfitInclude
            });
        });
        return toOutfit(outfit);
    }
    async duplicate(request, id) {
        const user = (0, current_user_1.requireCurrentUser)(request, this.auth);
        const source = await this.prisma.outfit.findFirstOrThrow({ where: { id, userId: user.id }, include: { items: true } });
        const copy = await this.prisma.outfit.create({
            data: {
                userId: user.id,
                name: `${source.name} copy`,
                description: source.description,
                occasion: source.occasion,
                season: source.season,
                source: "duplicate",
                items: { create: source.items.map((item) => ({ itemId: item.itemId, slot: item.slot, sortOrder: item.sortOrder })) }
            },
            include: exports.outfitInclude
        });
        return toOutfit(copy);
    }
    async favorite(request, id, body) {
        const user = (0, current_user_1.requireCurrentUser)(request, this.auth);
        const current = await this.prisma.outfit.findFirstOrThrow({ where: { id, userId: user.id } });
        const outfit = await this.prisma.outfit.update({
            where: { id, userId: user.id },
            data: { isFavorite: body.isFavorite ?? !current.isFavorite },
            include: exports.outfitInclude
        });
        return toOutfit(outfit);
    }
};
exports.OutfitsController = OutfitsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)("q")),
    __param(2, (0, common_1.Query)("occasion")),
    __param(3, (0, common_1.Query)("favorite")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", Promise)
], OutfitsController.prototype, "list", null);
__decorate([
    (0, common_1.Get)("summary"),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OutfitsController.prototype, "summary", null);
__decorate([
    (0, common_1.Get)(":id"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], OutfitsController.prototype, "get", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], OutfitsController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(":id"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("id")),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], OutfitsController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(":id/duplicate"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], OutfitsController.prototype, "duplicate", null);
__decorate([
    (0, common_1.Patch)(":id/favorite"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("id")),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], OutfitsController.prototype, "favorite", null);
exports.OutfitsController = OutfitsController = __decorate([
    (0, common_1.Controller)("outfits"),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        auth_service_1.AuthService])
], OutfitsController);
exports.outfitInclude = {
    items: {
        include: {
            item: {
                include: {
                    category: true,
                    tags: { include: { tag: { include: { _count: { select: { items: true } } } } } },
                    images: { orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }] }
                }
            }
        },
        orderBy: { sortOrder: "asc" }
    },
    plans: { orderBy: { startsAt: "desc" }, take: 1 }
};
function toOutfit(outfit) {
    return {
        id: outfit.id,
        name: outfit.name,
        occasion: outfit.occasion ?? "General",
        notes: outfit.description ?? "",
        isFavorite: outfit.isFavorite,
        usageCount: outfit.plans.filter((plan) => plan.status === "WORN").length,
        lastWornAt: outfit.plans.find((plan) => plan.status === "WORN")?.startsAt.toISOString() ?? null,
        items: outfit.items.map((outfitItem) => ({
            id: outfitItem.id,
            slot: slotToWeb(outfitItem.slot),
            sortOrder: outfitItem.sortOrder,
            wardrobeItem: (0, wardrobe_mapper_1.toWardrobeItem)(outfitItem.item)
        }))
    };
}
function slotForIndex(index) {
    if (index === 0)
        return client_1.OutfitSlot.TOP;
    if (index === 1)
        return client_1.OutfitSlot.BOTTOM;
    return client_1.OutfitSlot.ACCESSORY;
}
function slotToWeb(slot) {
    const map = {
        TOP: "top",
        BOTTOM: "bottom",
        DRESS: "traditional",
        OUTERWEAR: "other",
        SHOES: "footwear",
        BAG: "bag",
        ACCESSORY: "accessory",
        OTHER: "other"
    };
    return map[slot] ?? "other";
}
//# sourceMappingURL=outfits.controller.js.map