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
exports.CalendarController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth/auth.service");
const current_user_1 = require("./auth/current-user");
const outfits_controller_1 = require("./outfits.controller");
const prisma_service_1 = require("./prisma.service");
let CalendarController = class CalendarController {
    prisma;
    auth;
    constructor(prisma, auth) {
        this.prisma = prisma;
        this.auth = auth;
    }
    async list(request) {
        const user = (0, current_user_1.requireCurrentUser)(request, this.auth);
        const plans = await this.prisma.calendarPlan.findMany({
            where: { userId: user.id },
            include: { outfit: { include: outfits_controller_1.outfitInclude } },
            orderBy: { startsAt: "asc" }
        });
        return plans.map((plan) => toCalendarEvent(plan, conflictStatus(plan, plans)));
    }
    async summary(request) {
        const user = (0, current_user_1.requireCurrentUser)(request, this.auth);
        const plans = await this.prisma.calendarPlan.findMany({
            where: { userId: user.id, status: "PLANNED" },
            include: { outfit: { include: outfits_controller_1.outfitInclude } },
            orderBy: { startsAt: "asc" }
        });
        const next = plans.find((plan) => plan.startsAt >= new Date()) ?? plans[0];
        return {
            plannedOutfits: plans.length,
            conflictWarnings: plans.filter((plan) => conflictStatus(plan, plans) === "warning").length,
            nextEventName: next?.title ?? "No planned outfits",
            nextEventDate: next?.startsAt.toISOString() ?? ""
        };
    }
    async create(request, body) {
        const user = (0, current_user_1.requireCurrentUser)(request, this.auth);
        await this.prisma.outfit.findFirstOrThrow({ where: { id: body.outfitId, userId: user.id } });
        const plan = await this.prisma.calendarPlan.create({
            data: {
                userId: user.id,
                outfitId: body.outfitId,
                startsAt: new Date(body.startsAt),
                endsAt: body.endsAt ? new Date(body.endsAt) : undefined,
                title: body.eventName?.trim() || "Planned outfit",
                location: body.location,
                notes: body.notes
            },
            include: { outfit: { include: outfits_controller_1.outfitInclude } }
        });
        const plans = await this.prisma.calendarPlan.findMany({ where: { userId: user.id }, include: { outfit: { include: outfits_controller_1.outfitInclude } } });
        return toCalendarEvent(plan, conflictStatus(plan, plans));
    }
    async markWorn(request, id) {
        const user = (0, current_user_1.requireCurrentUser)(request, this.auth);
        const plan = await this.prisma.calendarPlan.findFirstOrThrow({
            where: { id, userId: user.id },
            include: { outfit: { include: { items: true } } }
        });
        const wornAt = plan.startsAt;
        await this.prisma.$transaction([
            this.prisma.calendarPlan.update({ where: { id, userId: user.id }, data: { status: "WORN" } }),
            ...plan.outfit.items.map((item) => this.prisma.wardrobeUsageLog.create({
                data: { userId: user.id, itemId: item.itemId, wornAt, context: plan.title, notes: plan.notes }
            })),
            ...plan.outfit.items.map((item) => this.prisma.wardrobeItem.update({
                where: { id: item.itemId, userId: user.id },
                data: { lastWornAt: wornAt, wearCount: { increment: 1 } }
            }))
        ]);
        return { ok: true };
    }
};
exports.CalendarController = CalendarController;
__decorate([
    (0, common_1.Get)("outfits"),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CalendarController.prototype, "list", null);
__decorate([
    (0, common_1.Get)("summary"),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CalendarController.prototype, "summary", null);
__decorate([
    (0, common_1.Post)("outfits"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CalendarController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)("outfits/:id/worn"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CalendarController.prototype, "markWorn", null);
exports.CalendarController = CalendarController = __decorate([
    (0, common_1.Controller)("calendar"),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        auth_service_1.AuthService])
], CalendarController);
function toCalendarEvent(plan, status) {
    return {
        id: plan.id,
        outfitId: plan.outfitId,
        outfit: (0, outfits_controller_1.toOutfit)(plan.outfit),
        eventName: plan.title,
        eventType: plan.outfit.occasion ?? "General",
        startsAt: plan.startsAt.toISOString(),
        endsAt: plan.endsAt?.toISOString() ?? "",
        location: plan.location ?? "",
        notes: plan.notes ?? "",
        conflictStatus: status,
        reminderStatus: "none"
    };
}
function conflictStatus(plan, allPlans) {
    const sameDay = allPlans.some((candidate) => candidate.id !== plan.id &&
        candidate.outfitId === plan.outfitId &&
        candidate.startsAt.toISOString().slice(0, 10) === plan.startsAt.toISOString().slice(0, 10));
    return sameDay ? "warning" : "none";
}
//# sourceMappingURL=calendar.controller.js.map