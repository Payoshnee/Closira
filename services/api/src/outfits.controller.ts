import { Body, Controller, Get, Param, Patch, Post, Query, Req } from "@nestjs/common";
import { OutfitSlot, Prisma } from "@prisma/client";
import type { Request } from "express";
import { AuthService } from "./auth/auth.service";
import { requireCurrentUser } from "./auth/current-user";
import { PrismaService } from "./prisma.service";
import { toWardrobeItem } from "./wardrobe.mapper";

type OutfitBody = {
  name?: string;
  occasion?: string;
  notes?: string;
  isFavorite?: boolean;
  itemIds?: string[];
};

@Controller("outfits")
export class OutfitsController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auth: AuthService
  ) {}

  @Get()
  async list(@Req() request: Request, @Query("q") q?: string, @Query("occasion") occasion?: string, @Query("favorite") favorite?: string) {
    const user = requireCurrentUser(request, this.auth);
    const outfits = await this.prisma.outfit.findMany({
      where: {
        userId: user.id,
        occasion: occasion || undefined,
        isFavorite: favorite === "true" ? true : undefined,
        OR: q ? [{ name: { contains: q, mode: "insensitive" } }, { description: { contains: q, mode: "insensitive" } }] : undefined
      },
      include: outfitInclude,
      orderBy: { updatedAt: "desc" }
    });
    return outfits.map(toOutfit);
  }

  @Get("summary")
  async summary(@Req() request: Request) {
    const user = requireCurrentUser(request, this.auth);
    const weekStart = new Date();
    const weekEnd = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const [totalOutfits, favoriteOutfits, plannedThisWeek, outfits] = await this.prisma.$transaction([
      this.prisma.outfit.count({ where: { userId: user.id } }),
      this.prisma.outfit.count({ where: { userId: user.id, isFavorite: true } }),
      this.prisma.calendarPlan.count({ where: { userId: user.id, startsAt: { gte: weekStart, lte: weekEnd } } }),
      this.prisma.outfit.findMany({ where: { userId: user.id }, select: { occasion: true } })
    ]);
    const counts = outfits.reduce<Record<string, number>>((acc, outfit) => {
      const key = outfit.occasion ?? "General";
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {});
    const mostUsedOccasion = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "None";
    return { totalOutfits, favoriteOutfits, plannedThisWeek, mostUsedOccasion };
  }

  @Get(":id")
  async get(@Req() request: Request, @Param("id") id: string) {
    const user = requireCurrentUser(request, this.auth);
    const outfit = await this.prisma.outfit.findFirstOrThrow({ where: { id, userId: user.id }, include: outfitInclude });
    return toOutfit(outfit);
  }

  @Post()
  async create(@Req() request: Request, @Body() body: OutfitBody) {
    const user = requireCurrentUser(request, this.auth);
    const outfit = await this.prisma.outfit.create({
      data: {
        userId: user.id,
        name: body.name?.trim() || "Untitled outfit",
        occasion: body.occasion?.trim(),
        description: body.notes,
        items: body.itemIds ? { create: body.itemIds.filter(Boolean).map((itemId, index) => ({ itemId, slot: slotForIndex(index), sortOrder: index })) } : undefined
      },
      include: outfitInclude
    });
    return toOutfit(outfit);
  }

  @Patch(":id")
  async update(@Req() request: Request, @Param("id") id: string, @Body() body: OutfitBody) {
    const user = requireCurrentUser(request, this.auth);
    const outfit = await this.prisma.$transaction(async (tx) => {
      if (body.itemIds) {
        await tx.outfitItem.deleteMany({ where: { outfitId: id, outfit: { userId: user.id } } });
        await tx.outfitItem.createMany({
          data: body.itemIds.filter(Boolean).map((itemId, index) => ({ outfitId: id, itemId, slot: slotForIndex(index), sortOrder: index }))
        });
      }
      return tx.outfit.update({
        where: { id, userId: user.id },
        data: { name: body.name, occasion: body.occasion, description: body.notes, isFavorite: body.isFavorite },
        include: outfitInclude
      });
    });
    return toOutfit(outfit);
  }

  @Post(":id/duplicate")
  async duplicate(@Req() request: Request, @Param("id") id: string) {
    const user = requireCurrentUser(request, this.auth);
    const source = await this.prisma.outfit.findFirstOrThrow({ where: { id, userId: user.id }, include: { items: true } });
    const copy = await this.prisma.outfit.create({
      data: {
        userId: user.id,
        name: `${source.name} copy`,
        description: source.description,
        occasion: source.occasion,
        season: source.season,
        source: "duplicate",
        items: { create: source.items.map((item) => ({ itemId: item.itemId, slot: item.slot, sortOrder: item.sortOrder })) }
      },
      include: outfitInclude
    });
    return toOutfit(copy);
  }

  @Patch(":id/favorite")
  async favorite(@Req() request: Request, @Param("id") id: string, @Body() body: { isFavorite?: boolean }) {
    const user = requireCurrentUser(request, this.auth);
    const current = await this.prisma.outfit.findFirstOrThrow({ where: { id, userId: user.id } });
    const outfit = await this.prisma.outfit.update({
      where: { id, userId: user.id },
      data: { isFavorite: body.isFavorite ?? !current.isFavorite },
      include: outfitInclude
    });
    return toOutfit(outfit);
  }
}

export const outfitInclude = {
  items: {
    include: {
      item: {
        include: {
          category: true,
          tags: { include: { tag: { include: { _count: { select: { items: true } } } } } },
          images: { orderBy: [{ isPrimary: "desc" as const }, { createdAt: "asc" as const }] }
        }
      }
    },
    orderBy: { sortOrder: "asc" as const }
  },
  plans: { orderBy: { startsAt: "desc" as const }, take: 1 }
};

export type OutfitWithRelations = Prisma.OutfitGetPayload<{ include: typeof outfitInclude }>;

export function toOutfit(outfit: OutfitWithRelations) {
  return {
    id: outfit.id,
    name: outfit.name,
    occasion: outfit.occasion ?? "General",
    notes: outfit.description ?? "",
    isFavorite: outfit.isFavorite,
    usageCount: outfit.plans.filter((plan) => plan.status === "WORN").length,
    lastWornAt: outfit.plans.find((plan) => plan.status === "WORN")?.startsAt.toISOString() ?? null,
    items: outfit.items.map((outfitItem) => ({
      id: outfitItem.id,
      slot: slotToWeb(outfitItem.slot),
      sortOrder: outfitItem.sortOrder,
      wardrobeItem: toWardrobeItem(outfitItem.item)
    }))
  };
}

function slotForIndex(index: number) {
  if (index === 0) return OutfitSlot.TOP;
  if (index === 1) return OutfitSlot.BOTTOM;
  return OutfitSlot.ACCESSORY;
}

function slotToWeb(slot: string) {
  const map: Record<string, string> = {
    TOP: "top",
    BOTTOM: "bottom",
    DRESS: "traditional",
    OUTERWEAR: "other",
    SHOES: "footwear",
    BAG: "bag",
    ACCESSORY: "accessory",
    OTHER: "other"
  };
  return map[slot] ?? "other";
}
