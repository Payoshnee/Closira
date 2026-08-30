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
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth/auth.service");
const current_user_1 = require("./auth/current-user");
const prisma_service_1 = require("./prisma.service");
let AdminController = class AdminController {
    prisma;
    auth;
    constructor(prisma, auth) {
        this.prisma = prisma;
        this.auth = auth;
    }
    async metrics(request) {
        (0, current_user_1.requireAdminUser)(request, this.auth);
        const [users, wardrobeItems, outfits, aiJobs, failedJobs, storage, activeSubs] = await this.prisma.$transaction([
            this.prisma.user.count({ where: { deletedAt: null } }),
            this.prisma.wardrobeItem.count({ where: { status: "ACTIVE" } }),
            this.prisma.outfit.count(),
            this.prisma.aiJob.count(),
            this.prisma.aiJob.count({ where: { status: "FAILED" } }),
            this.prisma.wardrobeImage.aggregate({ _sum: { byteSize: true }, _count: { id: true } }),
            this.prisma.subscription.count({ where: { status: "ACTIVE" } })
        ]);
        return [
            { label: "Users", value: String(users), detail: `${activeSubs} active subscriptions` },
            { label: "Wardrobe items", value: String(wardrobeItems), detail: `${storage._count.id} stored images` },
            { label: "Outfits", value: String(outfits), detail: "Persisted outfit combinations" },
            { label: "AI jobs", value: String(aiJobs), detail: `${failedJobs} failed jobs` },
            { label: "Storage", value: formatBytes(storage._sum.byteSize ?? 0), detail: "Wardrobe image bytes tracked" }
        ];
    }
    async health(request) {
        (0, current_user_1.requireAdminUser)(request, this.auth);
        const [failedAiJobs, pendingAiJobs, storageImages, activeGateways] = await this.prisma.$transaction([
            this.prisma.aiJob.count({ where: { status: "FAILED" } }),
            this.prisma.aiJob.count({ where: { status: { in: ["QUEUED", "RUNNING"] } } }),
            this.prisma.wardrobeImage.count(),
            this.prisma.billingGateway.count({ where: { status: { in: ["ENABLED", "TESTING"] } } })
        ]);
        return [
            { service: "Database", status: "ok", detail: "Prisma query completed successfully." },
            { service: "AI jobs", status: failedAiJobs ? "warning" : "ok", detail: `${pendingAiJobs} pending/running, ${failedAiJobs} failed.` },
            { service: "Storage", status: "ok", detail: `${storageImages} wardrobe images registered.` },
            { service: "Billing gateways", status: activeGateways ? "ok" : "warning", detail: `${activeGateways} gateways configured.` }
        ];
    }
    async users(request, q) {
        (0, current_user_1.requireAdminUser)(request, this.auth);
        const users = await this.prisma.user.findMany({
            where: {
                deletedAt: null,
                OR: q ? [{ email: { contains: q, mode: "insensitive" } }, { name: { contains: q, mode: "insensitive" } }] : undefined
            },
            include: { _count: { select: { wardrobeItems: true, outfits: true, aiJobs: true } }, subscriptions: { orderBy: { createdAt: "desc" }, take: 1 } },
            orderBy: { createdAt: "desc" },
            take: 50
        });
        return users.map((user) => ({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            emailVerified: Boolean(user.emailVerifiedAt),
            wardrobeItems: user._count.wardrobeItems,
            outfits: user._count.outfits,
            aiJobs: user._count.aiJobs,
            plan: user.subscriptions[0]?.plan ?? "FREE",
            createdAt: user.createdAt.toISOString()
        }));
    }
    async updateRole(request, id, body) {
        const actor = (0, current_user_1.requireAdminUser)(request, this.auth);
        const user = await this.prisma.user.update({ where: { id }, data: { role: body.role } });
        await this.prisma.auditLog.create({
            data: { actorId: actor.id, action: "admin.user.role_updated", entity: "user", entityId: id, metadata: { role: body.role } }
        });
        return { id: user.id, role: user.role };
    }
    async aiJobs(request) {
        (0, current_user_1.requireAdminUser)(request, this.auth);
        const jobs = await this.prisma.aiJob.findMany({
            include: { user: { select: { email: true, name: true } } },
            orderBy: { createdAt: "desc" },
            take: 50
        });
        return jobs.map((job) => ({
            id: job.id,
            user: job.user.email,
            type: job.type,
            provider: job.provider,
            status: job.status,
            confidence: Number(job.confidence ?? 0),
            errorMessage: job.errorMessage,
            createdAt: job.createdAt.toISOString()
        }));
    }
    async storage(request) {
        (0, current_user_1.requireAdminUser)(request, this.auth);
        const rows = await this.prisma.wardrobeImage.groupBy({ by: ["provider"], _sum: { byteSize: true }, _count: { id: true } });
        return rows.map((row) => ({ provider: row.provider, images: row._count.id, bytes: row._sum.byteSize ?? 0, displayBytes: formatBytes(row._sum.byteSize ?? 0) }));
    }
    async reports(request) {
        (0, current_user_1.requireAdminUser)(request, this.auth);
        const [newUsers, wornLogs, invoices] = await this.prisma.$transaction([
            this.prisma.user.count({ where: { createdAt: { gte: daysAgo(30) } } }),
            this.prisma.wardrobeUsageLog.count({ where: { wornAt: { gte: daysAgo(30) } } }),
            this.prisma.invoice.aggregate({ where: { paidAt: { gte: daysAgo(30) } }, _sum: { amountDue: true } })
        ]);
        return {
            period: "last_30_days",
            newUsers,
            wardrobeUsageLogs: wornLogs,
            revenue: Number(invoices._sum.amountDue ?? 0)
        };
    }
    async auditLogs(request) {
        (0, current_user_1.requireAdminUser)(request, this.auth);
        const logs = await this.prisma.auditLog.findMany({
            include: { actor: { select: { email: true, name: true } } },
            orderBy: { createdAt: "desc" },
            take: 50
        });
        return logs.map((log) => ({
            id: log.id,
            actor: log.actor?.email ?? "system",
            action: log.action,
            entity: log.entity,
            entityId: log.entityId,
            createdAt: log.createdAt.toISOString()
        }));
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Get)("metrics"),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "metrics", null);
__decorate([
    (0, common_1.Get)("health"),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "health", null);
__decorate([
    (0, common_1.Get)("users"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)("q")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "users", null);
__decorate([
    (0, common_1.Patch)("users/:id/role"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("id")),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateRole", null);
__decorate([
    (0, common_1.Get)("ai/jobs"),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "aiJobs", null);
__decorate([
    (0, common_1.Get)("storage"),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "storage", null);
__decorate([
    (0, common_1.Get)("reports"),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "reports", null);
__decorate([
    (0, common_1.Get)("audit-logs"),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "auditLogs", null);
exports.AdminController = AdminController = __decorate([
    (0, common_1.Controller)("admin"),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        auth_service_1.AuthService])
], AdminController);
function formatBytes(bytes) {
    if (bytes < 1024)
        return `${bytes} B`;
    if (bytes < 1024 * 1024)
        return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024)
        return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
    return `${(bytes / 1024 / 1024 / 1024).toFixed(1)} GB`;
}
function daysAgo(days) {
    return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}
//# sourceMappingURL=admin.controller.js.map