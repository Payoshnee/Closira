import { ForbiddenException } from "@nestjs/common";
import { createHmac } from "node:crypto";
import { EntitlementsService, verifyGatewaySignature } from "./entitlements.service";

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
    const service = new EntitlementsService(prisma as never);

    await expect(service.requireWardrobeItemSlot("user_1")).rejects.toBeInstanceOf(ForbiddenException);
  });

  it("allows AI requests below the monthly limit", async () => {
    prisma.subscription.findFirst.mockResolvedValue(null);
    prisma.aiJob.count.mockResolvedValue(24);
    const service = new EntitlementsService(prisma as never);

    await expect(service.requireAiRequest("user_1")).resolves.toBeUndefined();
  });

  it("blocks custom providers on the free plan", async () => {
    prisma.subscription.findFirst.mockResolvedValue(null);
    const service = new EntitlementsService(prisma as never);

    await expect(service.requireProvider("user_1", "OPENAI")).rejects.toBeInstanceOf(ForbiddenException);
  });
});

describe("verifyGatewaySignature", () => {
  it("accepts valid HMAC webhook signatures", () => {
    const body = { id: "evt_1" };
    const secret = "test_secret";
    const signature = createHmac("sha256", secret).update(JSON.stringify(body)).digest("hex");

    expect(() => verifyGatewaySignature(body, { "x-closira-signature": signature }, secret)).not.toThrow();
  });

  it("rejects invalid webhook signatures", () => {
    expect(() => verifyGatewaySignature({ id: "evt_1" }, { "x-closira-signature": "bad" }, "test_secret")).toThrow(ForbiddenException);
  });
});
