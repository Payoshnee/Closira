import { Body, Controller, Delete, Get, Param, Patch, Post, Req } from "@nestjs/common";
import type { Request } from "express";
import { AuthService } from "./auth/auth.service";
import { requireCurrentUser } from "./auth/current-user";
import { PrismaService } from "./prisma.service";

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

@Controller()
export class TaxonomyController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auth: AuthService
  ) {}

  @Get("categories")
  async listCategories(@Req() request: Request) {
    const user = requireCurrentUser(request, this.auth);
    const categories = await this.prisma.category.findMany({
      where: { userId: user.id },
      include: { _count: { select: { items: true } } },
      orderBy: { name: "asc" }
    });

    return categories.map((category, index) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      itemCount: category._count.items,
      isDefault: false,
      sortOrder: index + 1
    }));
  }

  @Post("categories")
  createCategory(@Req() request: Request, @Body() body: { name: string; color?: string }) {
    const user = requireCurrentUser(request, this.auth);
    return this.prisma.category.create({
      data: {
        userId: user.id,
        name: body.name.trim(),
        slug: slugify(body.name),
        color: body.color
      }
    });
  }

  @Patch("categories/:id")
  updateCategory(@Req() request: Request, @Param("id") id: string, @Body() body: { name?: string; color?: string }) {
    const user = requireCurrentUser(request, this.auth);
    return this.prisma.category.update({
      where: { id, userId: user.id },
      data: {
        name: body.name?.trim(),
        slug: body.name ? slugify(body.name) : undefined,
        color: body.color
      }
    });
  }

  @Delete("categories/:id")
  async deleteCategory(@Req() request: Request, @Param("id") id: string) {
    const user = requireCurrentUser(request, this.auth);
    await this.prisma.category.delete({ where: { id, userId: user.id } });
    return { ok: true };
  }

  @Get("tags")
  async listTags(@Req() request: Request) {
    const user = requireCurrentUser(request, this.auth);
    const tags = await this.prisma.tag.findMany({
      where: { userId: user.id },
      include: { _count: { select: { items: true } } },
      orderBy: { name: "asc" }
    });

    return tags.map((tag) => ({
      id: tag.id,
      type: "custom",
      name: tag.name,
      slug: tag.slug,
      itemCount: tag._count.items,
      isDefault: false
    }));
  }

  @Post("tags")
  createTag(@Req() request: Request, @Body() body: { name: string; color?: string }) {
    const user = requireCurrentUser(request, this.auth);
    return this.prisma.tag.create({
      data: {
        userId: user.id,
        name: body.name.trim(),
        slug: slugify(body.name),
        color: body.color
      }
    });
  }

  @Patch("tags/:id")
  updateTag(@Req() request: Request, @Param("id") id: string, @Body() body: { name?: string; color?: string }) {
    const user = requireCurrentUser(request, this.auth);
    return this.prisma.tag.update({
      where: { id, userId: user.id },
      data: {
        name: body.name?.trim(),
        slug: body.name ? slugify(body.name) : undefined,
        color: body.color
      }
    });
  }

  @Delete("tags/:id")
  async deleteTag(@Req() request: Request, @Param("id") id: string) {
    const user = requireCurrentUser(request, this.auth);
    await this.prisma.tag.delete({ where: { id, userId: user.id } });
    return { ok: true };
  }
}
