import { Body, Controller, Get, Patch, Req } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import type { Request } from "express";
import { AuthService } from "./auth/auth.service";
import { requireCurrentUser } from "./auth/current-user";
import { PrismaService } from "./prisma.service";

@Controller("profile")
export class ProfileController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auth: AuthService
  ) {}

  @Get()
  async getProfile(@Req() request: Request) {
    const current = requireCurrentUser(request, this.auth);
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: current.id },
      include: { profile: true }
    });
    const profile = user.profile ?? (await this.prisma.userProfile.create({ data: { userId: user.id } }));
    return toProfile(user, profile);
  }

  @Patch()
  async updateProfile(
    @Req() request: Request,
    @Body()
    body: {
      name?: string;
      email?: string;
      phone?: string;
      privacyMode?: "standard" | "strict";
      notificationsEnabled?: boolean;
      stylePreferences?: string[];
      favoriteColors?: string[];
    }
  ) {
    const current = requireCurrentUser(request, this.auth);
    const preferences = {
      phone: body.phone,
      privacyMode: body.privacyMode ?? "standard",
      notificationsEnabled: body.notificationsEnabled ?? true,
      favoriteColors: body.favoriteColors ?? []
    };

    const [user, profile] = await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: current.id },
        data: {
          name: body.name,
          email: body.email?.trim().toLowerCase()
        }
      }),
      this.prisma.userProfile.upsert({
        where: { userId: current.id },
        update: {
          styleWords: body.stylePreferences,
          preferences: preferences as Prisma.InputJsonValue
        },
        create: {
          userId: current.id,
          styleWords: body.stylePreferences ?? [],
          preferences: preferences as Prisma.InputJsonValue
        }
      })
    ]);

    await this.prisma.auditLog.create({
      data: { actorId: current.id, action: "profile.updated", entity: "user", entityId: current.id }
    });

    return toProfile(user, profile);
  }
}

type UserWithProfile = Prisma.UserGetPayload<{ include: { profile: true } }>;
type Profile = NonNullable<UserWithProfile["profile"]>;

function toProfile(user: { id: string; name: string; email: string }, profile: Profile) {
  const preferences = (profile.preferences ?? {}) as {
    phone?: string;
    privacyMode?: "standard" | "strict";
    notificationsEnabled?: boolean;
    favoriteColors?: string[];
  };

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: preferences.phone ?? "",
    stylePreferences: profile.styleWords,
    favoriteColors: preferences.favoriteColors ?? [],
    privacyMode: preferences.privacyMode ?? "standard",
    notificationsEnabled: preferences.notificationsEnabled ?? true
  };
}
