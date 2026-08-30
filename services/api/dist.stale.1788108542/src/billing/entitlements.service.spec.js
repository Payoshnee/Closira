"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const node_crypto_1 = require("node:crypto");
const entitlements_service_1 = require("./entitlements.service");
describe("EntitlementsService", () => {
    const prisma = {
        subscription: { findFirst: jest.fn() },
        wardrobeItem: { count: jest.fn() },
        wardrobeImage: { aggregate: jest.fn() },
        aiJob: { count: jest.fn() }
    };
    beforeEach(() => {
        jest.resetAllMocks();
    });
    it("blocks wardrobe creation when the plan item limit is reached", async () => {
        prisma.subscription.findFirst.mockResolvedValue(null);
        prisma.wardrobeItem.count.mockResolvedValue(50);
        const service = new entitlements_service_1.EntitlementsService(prisma);
        await expect(service.requireWardrobeItemSlot("user_1")).rejects.toBeInstanceOf(common_1.ForbiddenException);
    });
    it("allows AI requests below the monthly limit", async () => {
        prisma.subscription.findFirst.mockResolvedValue(null);
        prisma.aiJob.count.mockResolvedValue(24);
        const service = new entitlements_service_1.EntitlementsService(prisma);
        await expect(service.requireAiRequest("user_1")).resolves.toBeUndefined();
    });
    it("blocks custom providers on the free plan", async () => {
        prisma.subscription.findFirst.mockResolvedValue(null);
        const service = new entitlements_service_1.EntitlementsService(prisma);
        await expect(service.requireProvider("user_1", "OPENAI")).rejects.toBeInstanceOf(common_1.ForbiddenException);
    });
});
describe("verifyGatewaySignature", () => {
    it("accepts valid HMAC webhook signatures", () => {
        const body = { id: "evt_1" };
        const secret = "test_secret";
        const signature = (0, node_crypto_1.createHmac)("sha256", secret).update(JSON.stringify(body)).digest("hex");
        expect(() => (0, entitlements_service_1.verifyGatewaySignature)(body, { "x-closira-signature": signature }, secret)).not.toThrow();
    });
    it("rejects invalid webhook signatures", () => {
        expect(() => (0, entitlements_service_1.verifyGatewaySignature)({ id: "evt_1" }, { "x-closira-signature": "bad" }, "test_secret")).toThrow(common_1.ForbiddenException);
    });
});
//# sourceMappingURL=entitlements.service.spec.js.map