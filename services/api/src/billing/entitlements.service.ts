import { ForbiddenException, Injectable } from "@nestjs/common";
import { AiProviderType, Prisma, SubscriptionPlan } from "@prisma/client";
import { createHmac, timingSafeEqual } from "node:crypto";
import { PrismaService } from "../prisma.service";

export type EntitlementKey = "wardrobeItems" | "aiRequestsPerMonth" | "customProviders" | "storageBytes";

export const defaultEntitlements: Record<SubscriptionPlan, Record<EntitlementKey, number | boolean>> = {
  FREE: { wardrobeItems: 50, aiRequestsPerMonth: 25, customProviders: false, storageBytes: 250 * 1024 * 1024 },
  PRO: { wardrobeItems: 500, aiRequestsPerMonth: 1000, customProviders: true, storageBytes: 10 * 1024 * 1024 * 1024 },
  STYLIST: { wardrobeItems: 5000, aiRequestsPerMonth: 5000, customProviders: true, storageBytes: 100 * 1024 * 1024 * 1024 },
  ENTERPRISE: { wardrobeItems: 100000, aiRequestsPerMonth: 50000, customProviders: true, storageBytes: 1024 * 1024 * 1024 * 1024 }
};

@Injectable()
export class EntitlementsService {
  constructor(private readonly prisma: PrismaService) {}

  async current(userId: string) {
    const subscription = await this.prisma.subscription.findFirst({
      where: { userId, status: { in: ["TRIALING", "ACTIVE"] } },
      orderBy: { createdAt: "desc" }
    });
    const plan = subscription?.plan ?? "FREE";
    return {
      plan,
      subscription,
      limits: { ...defaultEntitlements[plan], ...jsonEntitlements(subscription?.entitlements) }
    };
  }

  async requireWardrobeItemSlot(userId: string) {
    const { limits } = await this.current(userId);
    const limit = numberLimit(limits.wardrobeItems);
    const count = await this.prisma.wardrobeItem.count({ where: { userId, status: "ACTIVE" } });
    if (count >= limit) {
      throw new ForbiddenException(`Your plan allows ${limit} wardrobe items. Upgrade to add more.`);
    }
  }

  async requireStorageBytes(userId: string, nextUploadBytes: number) {
    const { limits } = await this.current(userId);
    const limit = numberLimit(limits.storageBytes);
    const aggregate = await this.prisma.wardrobeImage.aggregate({
      where: { item: { userId } },
      _sum: { byteSize: true }
    });
    const used = aggregate._sum.byteSize ?? 0;
    if (used + nextUploadBytes > limit) {
      throw new ForbiddenException(`Your plan storage limit is ${formatBytes(limit)}. Upgrade or delete images to upload more.`);
    }
  }

  async requireAiRequest(userId: string) {
    const { limits } = await this.current(userId);
    const limit = numberLimit(limits.aiRequestsPerMonth);
    const used = await this.prisma.aiJob.count({
      where: {
        userId,
        createdAt: { gte: startOfCurrentMonth() }
      }
    });
    if (used >= limit) {
      throw new ForbiddenException(`Your plan allows ${limit} AI requests per month. Upgrade to continue.`);
    }
  }

  async requireProvider(userId: string, provider: AiProviderType) {
    if (provider === "NATIVE") return;
    const { limits } = await this.current(userId);
    if (limits.customProviders !== true) {
      throw new ForbiddenException("Custom AI providers require a paid plan.");
    }
  }
}

export function verifyGatewaySignature(rawBody: unknown, headers: Record<string, string | string[] | undefined>, secret?: string) {
  if (!secret) return;
  const signature = headerValue(headers, "x-closira-signature") ?? headerValue(headers, "x-webhook-signature");
  if (!signature) {
    throw new ForbiddenException("Missing webhook signature.");
  }
  const payload = JSON.stringify(rawBody ?? {});
  const expected = createHmac("sha256", secret).update(payload).digest("hex");
  const actual = signature.replace(/^sha256=/, "");
  const expectedBuffer = Buffer.from(expected);
  const actualBuffer = Buffer.from(actual);
  if (expectedBuffer.length !== actualBuffer.length || !timingSafeEqual(expectedBuffer, actualBuffer)) {
    throw new ForbiddenException("Invalid webhook signature.");
  }
}

function jsonEntitlements(value?: Prisma.JsonValue | null) {
  return typeof value === "object" && value && !Array.isArray(value) ? (value as Record<string, number | boolean>) : {};
}

function numberLimit(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function startOfCurrentMonth() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}

function formatBytes(bytes: number) {
  if (bytes >= 1024 * 1024 * 1024) return `${Math.round(bytes / 1024 / 1024 / 1024)}GB`;
  return `${Math.round(bytes / 1024 / 1024)}MB`;
}

function headerValue(headers: Record<string, string | string[] | undefined>, name: string) {
  const value = headers[name] ?? headers[name.toLowerCase()];
  return Array.isArray(value) ? value[0] : value;
}
