import { Body, Controller, Get, Param, Patch, Post, Req } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import type { Request } from "express";
import { AuthService } from "./auth/auth.service";
import { requireCurrentUser } from "./auth/current-user";
import { outfitInclude, toOutfit } from "./outfits.controller";
import { PrismaService } from "./prisma.service";

type CalendarBody = {
  outfitId: string;
  eventName?: string;
  eventType?: string;
  startsAt: string;
  endsAt?: string;
  location?: string;
  notes?: string;
};

@Controller("calendar")
export class CalendarController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auth: AuthService
  ) {}

  @Get("outfits")
  async list(@Req() request: Request) {
    const user = requireCurrentUser(request, this.auth);
    const plans = await this.prisma.calendarPlan.findMany({
      where: { userId: user.id },
      include: { outfit: { include: outfitInclude } },
      orderBy: { startsAt: "asc" }
    });
    return plans.map((plan) => toCalendarEvent(plan, conflictStatus(plan, plans)));
  }

  @Get("summary")
  async summary(@Req() request: Request) {
    const user = requireCurrentUser(request, this.auth);
    const plans = await this.prisma.calendarPlan.findMany({
      where: { userId: user.id, status: "PLANNED" },
      include: { outfit: { include: outfitInclude } },
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

  @Post("outfits")
  async create(@Req() request: Request, @Body() body: CalendarBody) {
    const user = requireCurrentUser(request, this.auth);
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
      include: { outfit: { include: outfitInclude } }
    });
    const plans = await this.prisma.calendarPlan.findMany({ where: { userId: user.id }, include: { outfit: { include: outfitInclude } } });
    return toCalendarEvent(plan, conflictStatus(plan, plans));
  }

  @Patch("outfits/:id/worn")
  async markWorn(@Req() request: Request, @Param("id") id: string) {
    const user = requireCurrentUser(request, this.auth);
    const plan = await this.prisma.calendarPlan.findFirstOrThrow({
      where: { id, userId: user.id },
      include: { outfit: { include: { items: true } } }
    });

    const wornAt = plan.startsAt;
    await this.prisma.$transaction([
      this.prisma.calendarPlan.update({ where: { id, userId: user.id }, data: { status: "WORN" } }),
      ...plan.outfit.items.map((item) =>
        this.prisma.wardrobeUsageLog.create({
          data: { userId: user.id, itemId: item.itemId, wornAt, context: plan.title, notes: plan.notes }
        })
      ),
      ...plan.outfit.items.map((item) =>
        this.prisma.wardrobeItem.update({
          where: { id: item.itemId, userId: user.id },
          data: { lastWornAt: wornAt, wearCount: { increment: 1 } }
        })
      )
    ]);

    return { ok: true };
  }
}

type CalendarPlanWithOutfit = Prisma.CalendarPlanGetPayload<{ include: { outfit: { include: typeof outfitInclude } } }>;

function toCalendarEvent(plan: CalendarPlanWithOutfit, status: "none" | "warning") {
  return {
    id: plan.id,
    outfitId: plan.outfitId,
    outfit: toOutfit(plan.outfit),
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

function conflictStatus(plan: { id: string; outfitId: string; startsAt: Date }, allPlans: { id: string; outfitId: string; startsAt: Date }[]) {
  const sameDay = allPlans.some(
    (candidate) =>
      candidate.id !== plan.id &&
      candidate.outfitId === plan.outfitId &&
      candidate.startsAt.toISOString().slice(0, 10) === plan.startsAt.toISOString().slice(0, 10)
  );
  return sameDay ? "warning" : "none";
}
