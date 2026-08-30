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
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntitlementsService = exports.defaultEntitlements = void 0;
exports.verifyGatewaySignature = verifyGatewaySignature;
const common_1 = require("@nestjs/common");
const node_crypto_1 = require("node:crypto");
const prisma_service_1 = require("../prisma.service");
exports.defaultEntitlements = {
    FREE: { wardrobeItems: 50, aiRequestsPerMonth: 25, customProviders: false, storageBytes: 250 * 1024 * 1024 },
    PRO: { wardrobeItems: 500, aiRequestsPerMonth: 1000, customProviders: true, storageBytes: 10 * 1024 * 1024 * 1024 },
    STYLIST: { wardrobeItems: 5000, aiRequestsPerMonth: 5000, customProviders: true, storageBytes: 100 * 1024 * 1024 * 1024 },
    ENTERPRISE: { wardrobeItems: 100000, aiRequestsPerMonth: 50000, customProviders: true, storageBytes: 1024 * 1024 * 1024 * 1024 }
};
let EntitlementsService = class EntitlementsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async current(userId) {
        const subscription = await this.prisma.subscription.findFirst({
            where: { userId, status: { in: ["TRIALING", "ACTIVE"] } },
            orderBy: { createdAt: "desc" }
        });
        const plan = subscription?.plan ?? "FREE";
        return {
            plan,
            subscription,
            limits: { ...exports.defaultEntitlements[plan], ...jsonEntitlements(subscription?.entitlements) }
        };
    }
    async requireWardrobeItemSlot(userId) {
        const { limits } = await this.current(userId);
        const limit = numberLimit(limits.wardrobeItems);
        const count = await this.prisma.wardrobeItem.count({ where: { userId, status: "ACTIVE" } });
        if (count >= limit) {
            throw new common_1.ForbiddenException(`Your plan allows ${limit} wardrobe items. Upgrade to add more.`);
        }
    }
    async requireStorageBytes(userId, nextUploadBytes) {
        const { limits } = await this.current(userId);
        const limit = numberLimit(limits.storageBytes);
        const aggregate = await this.prisma.wardrobeImage.aggregate({
            where: { item: { userId } },
            _sum: { byteSize: true }
        });
        const used = aggregate._sum.byteSize ?? 0;
        if (used + nextUploadBytes > limit) {
            throw new common_1.ForbiddenException(`Your plan storage limit is ${formatBytes(limit)}. Upgrade or delete images to upload more.`);
        }
    }
    async requireAiRequest(userId) {
        const { limits } = await this.current(userId);
        const limit = numberLimit(limits.aiRequestsPerMonth);
        const used = await this.prisma.aiJob.count({
            where: {
                userId,
                createdAt: { gte: startOfCurrentMonth() }
            }
        });
        if (used >= limit) {
            throw new common_1.ForbiddenException(`Your plan allows ${limit} AI requests per month. Upgrade to continue.`);
        }
    }
    async requireProvider(userId, provider) {
        if (provider === "NATIVE")
            return;
        const { limits } = await this.current(userId);
        if (limits.customProviders !== true) {
            throw new common_1.ForbiddenException("Custom AI providers require a paid plan.");
        }
    }
};
exports.EntitlementsService = EntitlementsService;
exports.EntitlementsService = EntitlementsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], EntitlementsService);
function verifyGatewaySignature(rawBody, headers, secret) {
    if (!secret)
        return;
    const signature = headerValue(headers, "x-closira-signature") ?? headerValue(headers, "x-webhook-signature");
    if (!signature) {
        throw new common_1.ForbiddenException("Missing webhook signature.");
    }
    const payload = JSON.stringify(rawBody ?? {});
    const expected = (0, node_crypto_1.createHmac)("sha256", secret).update(payload).digest("hex");
    const actual = signature.replace(/^sha256=/, "");
    const expectedBuffer = Buffer.from(expected);
    const actualBuffer = Buffer.from(actual);
    if (expectedBuffer.length !== actualBuffer.length || !(0, node_crypto_1.timingSafeEqual)(expectedBuffer, actualBuffer)) {
        throw new common_1.ForbiddenException("Invalid webhook signature.");
    }
}
function jsonEntitlements(value) {
    return typeof value === "object" && value && !Array.isArray(value) ? value : {};
}
function numberLimit(value) {
    return typeof value === "number" && Number.isFinite(value) ? value : 0;
}
function startOfCurrentMonth() {
    const now = new Date();
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}
function formatBytes(bytes) {
    if (bytes >= 1024 * 1024 * 1024)
        return `${Math.round(bytes / 1024 / 1024 / 1024)}GB`;
    return `${Math.round(bytes / 1024 / 1024)}MB`;
}
function headerValue(headers, name) {
    const value = headers[name] ?? headers[name.toLowerCase()];
    return Array.isArray(value) ? value[0] : value;
}
//# sourceMappingURL=entitlements.service.js.map