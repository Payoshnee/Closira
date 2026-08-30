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
exports.ProfileController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth/auth.service");
const current_user_1 = require("./auth/current-user");
const prisma_service_1 = require("./prisma.service");
let ProfileController = class ProfileController {
    prisma;
    auth;
    constructor(prisma, auth) {
        this.prisma = prisma;
        this.auth = auth;
    }
    async getProfile(request) {
        const current = (0, current_user_1.requireCurrentUser)(request, this.auth);
        const user = await this.prisma.user.findUniqueOrThrow({
            where: { id: current.id },
            include: { profile: true }
        });
        const profile = user.profile ?? (await this.prisma.userProfile.create({ data: { userId: user.id } }));
        return toProfile(user, profile);
    }
    async updateProfile(request, body) {
        const current = (0, current_user_1.requireCurrentUser)(request, this.auth);
        const preferences = {
            phone: body.phone,
            privacyMode: body.privacyMode ?? "standard",
            notificationsEnabled: body.notificationsEnabled ?? true,
            favoriteColors: body.favoriteColors ?? []
        };
        const [user, profile] = await this.prisma.$transaction([
            this.prisma.user.update({
                where: { id: current.id },
                data: {
                    name: body.name,
                    email: body.email?.trim().toLowerCase()
                }
            }),
            this.prisma.userProfile.upsert({
                where: { userId: current.id },
                update: {
                    styleWords: body.stylePreferences,
                    preferences: preferences
                },
                create: {
                    userId: current.id,
                    styleWords: body.stylePreferences ?? [],
                    preferences: preferences
                }
            })
        ]);
        await this.prisma.auditLog.create({
            data: { actorId: current.id, action: "profile.updated", entity: "user", entityId: current.id }
        });
        return toProfile(user, profile);
    }
};
exports.ProfileController = ProfileController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProfileController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Patch)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ProfileController.prototype, "updateProfile", null);
exports.ProfileController = ProfileController = __decorate([
    (0, common_1.Controller)("profile"),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        auth_service_1.AuthService])
], ProfileController);
function toProfile(user, profile) {
    const preferences = (profile.preferences ?? {});
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: preferences.phone ?? "",
        stylePreferences: profile.styleWords,
        favoriteColors: preferences.favoriteColors ?? [],
        privacyMode: preferences.privacyMode ?? "standard",
        notificationsEnabled: preferences.notificationsEnabled ?? true
    };
}
//# sourceMappingURL=profile.controller.js.map