import { Body, Controller, Get, Param, Patch, Query, Req } from "@nestjs/common";
import { UserRole } from "@prisma/client";
import type { Request } from "express";
import { AuthService } from "./auth/auth.service";
import { requireAdminUser } from "./auth/current-user";
import { PrismaService } from "./prisma.service";

@Controller("admin")
export class AdminController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auth: AuthService
  ) {}

  @Get("metrics")
  async metrics(@Req() request: Request) {
    requireAdminUser(request, this.auth);
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

  @Get("health")
  async health(@Req() request: Request) {
    requireAdminUser(request, this.auth);
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

  @Get("users")
  async users(@Req() request: Request, @Query("q") q?: string) {
    requireAdminUser(request, this.auth);
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

  @Patch("users/:id/role")
  async updateRole(@Req() request: Request, @Param("id") id: string, @Body() body: { role: UserRole }) {
    const actor = requireAdminUser(request, this.auth);
    const user = await this.prisma.user.update({ where: { id }, data: { role: body.role } });
    await this.prisma.auditLog.create({
      data: { actorId: actor.id, action: "admin.user.role_updated", entity: "user", entityId: id, metadata: { role: body.role } }
    });
    return { id: user.id, role: user.role };
  }

  @Get("ai/jobs")
  async aiJobs(@Req() request: Request) {
    requireAdminUser(request, this.auth);
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

  @Get("storage")
  async storage(@Req() request: Request) {
    requireAdminUser(request, this.auth);
    const rows = await this.prisma.wardrobeImage.groupBy({ by: ["provider"], _sum: { byteSize: true }, _count: { id: true } });
    return rows.map((row) => ({ provider: row.provider, images: row._count.id, bytes: row._sum.byteSize ?? 0, displayBytes: formatBytes(row._sum.byteSize ?? 0) }));
  }

  @Get("reports")
  async reports(@Req() request: Request) {
    requireAdminUser(request, this.auth);
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

  @Get("audit-logs")
  async auditLogs(@Req() request: Request) {
    requireAdminUser(request, this.auth);
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
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(1)} GB`;
}

function daysAgo(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}
