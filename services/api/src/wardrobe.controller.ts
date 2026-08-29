import { Body, Controller, Get, Param, Patch, Post, Query, Req } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import type { Request } from "express";
import { AuthService } from "./auth/auth.service";
import { requireCurrentUser } from "./auth/current-user";
import { PrismaService } from "./prisma.service";
import { StorageService } from "./storage/storage.service";
import { itemInclude, toWardrobeItem } from "./wardrobe.mapper";

type WardrobeBody = {
  title?: string;
  name?: string;
  categoryId?: string;
  primaryColor?: string;
  color?: string;
  secondaryColors?: string[];
  material?: string;
  pattern?: string;
  brand?: string;
  purchasePrice?: number;
  currency?: string;
  size?: string;
  season?: string | string[];
  occasions?: string[];
  notes?: string;
  isFavorite?: boolean;
  tagIds?: string[];
};

@Controller("wardrobe")
export class WardrobeController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auth: AuthService,
    private readonly storage: StorageService
  ) {}

  @Get("items")
  async listItems(
    @Req() request: Request,
    @Query("q") q?: string,
    @Query("categoryId") categoryId?: string,
    @Query("tagId") tagId?: string,
    @Query("favorite") favorite?: string,
    @Query("neverWorn") neverWorn?: string,
    @Query("sort") sort = "updatedAt_desc",
    @Query("page") page = "1",
    @Query("pageSize") pageSize = "24"
  ) {
    const user = requireCurrentUser(request, this.auth);
    const take = Math.min(Math.max(Number(pageSize) || 24, 1), 100);
    const skip = (Math.max(Number(page) || 1, 1) - 1) * take;
    const where: Prisma.WardrobeItemWhereInput = {
      userId: user.id,
      status: "ACTIVE",
      categoryId: categoryId || undefined,
      isFavorite: favorite === "true" ? true : undefined,
      wearCount: neverWorn === "true" ? 0 : undefined,
      tags: tagId ? { some: { tagId } } : undefined,
      OR: q
        ? [
            { name: { contains: q, mode: "insensitive" } },
            { brand: { contains: q, mode: "insensitive" } },
            { color: { contains: q, mode: "insensitive" } },
            { material: { contains: q, mode: "insensitive" } }
          ]
        : undefined
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.wardrobeItem.findMany({
        where,
        include: itemInclude,
        orderBy: this.orderBy(sort),
        skip,
        take
      }),
      this.prisma.wardrobeItem.count({ where })
    ]);

    return { items: items.map(toWardrobeItem), total, page: Number(page), pageSize: take };
  }

  @Get("summary")
  async summary(@Req() request: Request) {
    const user = requireCurrentUser(request, this.auth);
    const [totalItems, favoriteItems, neverWornItems, valueRows, categories] = await this.prisma.$transaction([
      this.prisma.wardrobeItem.count({ where: { userId: user.id, status: "ACTIVE" } }),
      this.prisma.wardrobeItem.count({ where: { userId: user.id, status: "ACTIVE", isFavorite: true } }),
      this.prisma.wardrobeItem.count({ where: { userId: user.id, status: "ACTIVE", wearCount: 0 } }),
      this.prisma.wardrobeItem.aggregate({
        where: { userId: user.id, status: "ACTIVE" },
        _sum: { purchasePrice: true }
      }),
      this.prisma.category.findMany({
        where: { userId: user.id },
        include: { _count: { select: { items: true } } },
        orderBy: { name: "asc" }
      })
    ]);
    const mostUsedCategory = categories.sort((a, b) => b._count.items - a._count.items)[0]?.name ?? "None";

    return {
      totalItems,
      favoriteItems,
      neverWornItems,
      totalValue: Number(valueRows._sum.purchasePrice ?? 0),
      mostUsedCategory
    };
  }

  @Get("items/:id")
  async getItem(@Req() request: Request, @Param("id") id: string) {
    const user = requireCurrentUser(request, this.auth);
    const item = await this.prisma.wardrobeItem.findFirstOrThrow({
      where: { id, userId: user.id, status: "ACTIVE" },
      include: itemInclude
    });
    return toWardrobeItem(item);
  }

  @Post("items")
  async createItem(@Req() request: Request, @Body() body: WardrobeBody) {
    const user = requireCurrentUser(request, this.auth);
    const item = await this.prisma.wardrobeItem.create({
      data: {
        ...this.createItemData(user.id, body),
        tags: body.tagIds ? { create: body.tagIds.map((tagId) => ({ tagId })) } : undefined
      },
      include: itemInclude
    });
    return toWardrobeItem(item);
  }

  @Patch("items/:id")
  async updateItem(@Req() request: Request, @Param("id") id: string, @Body() body: WardrobeBody) {
    const user = requireCurrentUser(request, this.auth);
    const item = await this.prisma.$transaction(async (tx) => {
      if (body.tagIds) {
        await tx.wardrobeTag.deleteMany({ where: { itemId: id, item: { userId: user.id } } });
        await tx.wardrobeTag.createMany({ data: body.tagIds.map((tagId) => ({ itemId: id, tagId })) });
      }

      return tx.wardrobeItem.update({
        where: { id, userId: user.id },
        data: this.updateItemData(body),
        include: itemInclude
      });
    });
    return toWardrobeItem(item);
  }

  @Patch("items/:id/favorite")
  async toggleFavorite(@Req() request: Request, @Param("id") id: string, @Body() body: { isFavorite?: boolean }) {
    const user = requireCurrentUser(request, this.auth);
    const current = await this.prisma.wardrobeItem.findFirstOrThrow({ where: { id, userId: user.id } });
    const item = await this.prisma.wardrobeItem.update({
      where: { id, userId: user.id },
      data: { isFavorite: body.isFavorite ?? !current.isFavorite },
      include: itemInclude
    });
    return toWardrobeItem(item);
  }

  @Post("items/:id/mark-worn")
  async markWorn(@Req() request: Request, @Param("id") id: string, @Body() body: { wornAt?: string; context?: string; notes?: string }) {
    const user = requireCurrentUser(request, this.auth);
    const wornAt = body.wornAt ? new Date(body.wornAt) : new Date();
    const item = await this.prisma.$transaction(async (tx) => {
      await tx.wardrobeUsageLog.create({
        data: { userId: user.id, itemId: id, wornAt, context: body.context, notes: body.notes }
      });
      return tx.wardrobeItem.update({
        where: { id, userId: user.id },
        data: { lastWornAt: wornAt, wearCount: { increment: 1 } },
        include: itemInclude
      });
    });
    return toWardrobeItem(item);
  }

  @Post("items/:id/upload-url")
  async createUploadUrl(
    @Req() request: Request,
    @Param("id") id: string,
    @Body() body: { fileName: string; contentType: string; byteSize: number }
  ) {
    const user = requireCurrentUser(request, this.auth);
    await this.prisma.wardrobeItem.findFirstOrThrow({ where: { id, userId: user.id } });
    const safeName = body.fileName.replace(/[^a-zA-Z0-9._-]/g, "-");
    const storageKey = `users/${user.id}/wardrobe/${id}/${Date.now()}-${safeName}`;
    const signedUpload = await this.storage.createSignedUpload({
      key: storageKey,
      contentType: body.contentType,
      byteSize: body.byteSize
    });
    const image = await this.prisma.wardrobeImage.create({
      data: {
        itemId: id,
        storageKey: signedUpload.storageKey,
        provider: signedUpload.provider,
        url: signedUpload.publicUrl,
        contentType: body.contentType,
        byteSize: body.byteSize,
        altText: safeName,
        isPrimary: false
      }
    });

    return {
      imageId: image.id,
      storageKey: signedUpload.storageKey,
      uploadUrl: signedUpload.uploadUrl,
      publicUrl: signedUpload.publicUrl,
      expiresInSeconds: signedUpload.expiresInSeconds,
      headers: signedUpload.headers ?? {}
    };
  }

  @Patch("items/:id/archive")
  async archiveItem(@Req() request: Request, @Param("id") id: string) {
    const user = requireCurrentUser(request, this.auth);
    await this.prisma.wardrobeItem.update({ where: { id, userId: user.id }, data: { status: "ARCHIVED" } });
    return { ok: true };
  }

  private createItemData(userId: string, body: WardrobeBody): Prisma.WardrobeItemUncheckedCreateInput {
    const season = Array.isArray(body.season) ? body.season : body.season ? [body.season] : undefined;
    return {
      userId,
      name: body.title ?? body.name ?? "Untitled item",
      categoryId: body.categoryId,
      color: body.primaryColor ?? body.color,
      secondaryColors: body.secondaryColors,
      material: body.material,
      pattern: body.pattern,
      brand: body.brand,
      purchasePrice: body.purchasePrice,
      purchaseCurrency: body.currency,
      size: body.size,
      season,
      occasions: body.occasions,
      notes: body.notes,
      isFavorite: body.isFavorite
    };
  }

  private updateItemData(body: WardrobeBody): Prisma.WardrobeItemUncheckedUpdateInput {
    const season = Array.isArray(body.season) ? body.season : body.season ? [body.season] : undefined;
    return {
      name: body.title ?? body.name,
      categoryId: body.categoryId,
      color: body.primaryColor ?? body.color,
      secondaryColors: body.secondaryColors,
      material: body.material,
      pattern: body.pattern,
      brand: body.brand,
      purchasePrice: body.purchasePrice,
      purchaseCurrency: body.currency,
      size: body.size,
      season,
      occasions: body.occasions,
      notes: body.notes,
      isFavorite: body.isFavorite
    };
  }

  private orderBy(sort: string): Prisma.WardrobeItemOrderByWithRelationInput {
    if (sort === "name_asc") return { name: "asc" };
    if (sort === "wearCount_desc") return { wearCount: "desc" };
    if (sort === "lastWornAt_desc") return { lastWornAt: "desc" };
    return { updatedAt: "desc" };
  }
}
