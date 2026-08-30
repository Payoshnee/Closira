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
exports.TaxonomyController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth/auth.service");
const current_user_1 = require("./auth/current-user");
const prisma_service_1 = require("./prisma.service");
function slugify(value) {
    return value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
}
let TaxonomyController = class TaxonomyController {
    prisma;
    auth;
    constructor(prisma, auth) {
        this.prisma = prisma;
        this.auth = auth;
    }
    async listCategories(request) {
        const user = (0, current_user_1.requireCurrentUser)(request, this.auth);
        const categories = await this.prisma.category.findMany({
            where: { userId: user.id },
            include: { _count: { select: { items: true } } },
            orderBy: { name: "asc" }
        });
        return categories.map((category, index) => ({
            id: category.id,
            name: category.name,
            slug: category.slug,
            itemCount: category._count.items,
            isDefault: false,
            sortOrder: index + 1
        }));
    }
    createCategory(request, body) {
        const user = (0, current_user_1.requireCurrentUser)(request, this.auth);
        return this.prisma.category.create({
            data: {
                userId: user.id,
                name: body.name.trim(),
                slug: slugify(body.name),
                color: body.color
            }
        });
    }
    updateCategory(request, id, body) {
        const user = (0, current_user_1.requireCurrentUser)(request, this.auth);
        return this.prisma.category.update({
            where: { id, userId: user.id },
            data: {
                name: body.name?.trim(),
                slug: body.name ? slugify(body.name) : undefined,
                color: body.color
            }
        });
    }
    async deleteCategory(request, id) {
        const user = (0, current_user_1.requireCurrentUser)(request, this.auth);
        await this.prisma.category.delete({ where: { id, userId: user.id } });
        return { ok: true };
    }
    async listTags(request) {
        const user = (0, current_user_1.requireCurrentUser)(request, this.auth);
        const tags = await this.prisma.tag.findMany({
            where: { userId: user.id },
            include: { _count: { select: { items: true } } },
            orderBy: { name: "asc" }
        });
        return tags.map((tag) => ({
            id: tag.id,
            type: "custom",
            name: tag.name,
            slug: tag.slug,
            itemCount: tag._count.items,
            isDefault: false
        }));
    }
    createTag(request, body) {
        const user = (0, current_user_1.requireCurrentUser)(request, this.auth);
        return this.prisma.tag.create({
            data: {
                userId: user.id,
                name: body.name.trim(),
                slug: slugify(body.name),
                color: body.color
            }
        });
    }
    updateTag(request, id, body) {
        const user = (0, current_user_1.requireCurrentUser)(request, this.auth);
        return this.prisma.tag.update({
            where: { id, userId: user.id },
            data: {
                name: body.name?.trim(),
                slug: body.name ? slugify(body.name) : undefined,
                color: body.color
            }
        });
    }
    async deleteTag(request, id) {
        const user = (0, current_user_1.requireCurrentUser)(request, this.auth);
        await this.prisma.tag.delete({ where: { id, userId: user.id } });
        return { ok: true };
    }
};
exports.TaxonomyController = TaxonomyController;
__decorate([
    (0, common_1.Get)("categories"),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TaxonomyController.prototype, "listCategories", null);
__decorate([
    (0, common_1.Post)("categories"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], TaxonomyController.prototype, "createCategory", null);
__decorate([
    (0, common_1.Patch)("categories/:id"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("id")),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], TaxonomyController.prototype, "updateCategory", null);
__decorate([
    (0, common_1.Delete)("categories/:id"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], TaxonomyController.prototype, "deleteCategory", null);
__decorate([
    (0, common_1.Get)("tags"),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TaxonomyController.prototype, "listTags", null);
__decorate([
    (0, common_1.Post)("tags"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], TaxonomyController.prototype, "createTag", null);
__decorate([
    (0, common_1.Patch)("tags/:id"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("id")),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], TaxonomyController.prototype, "updateTag", null);
__decorate([
    (0, common_1.Delete)("tags/:id"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], TaxonomyController.prototype, "deleteTag", null);
exports.TaxonomyController = TaxonomyController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        auth_service_1.AuthService])
], TaxonomyController);
//# sourceMappingURL=taxonomy.controller.js.map