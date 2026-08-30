import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { UserRole } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import { randomBytes, createHash } from "node:crypto";
import { MailService } from "../mail/mail.service";
import { PrismaService } from "../prisma.service";
import { csrfCookieName } from "../security/csrf.middleware";
import { LoginLockoutService } from "./login-lockout.service";

const ACCESS_COOKIE = "closira_access";
const REFRESH_COOKIE = "closira_refresh";
const ACCESS_TTL_SECONDS = 15 * 60;
const REFRESH_TTL_SECONDS = 30 * 24 * 60 * 60;

type TokenPayload = {
  sub: string;
  email: string;
  role: UserRole;
};

type CookieResponse = {
  cookie(name: string, value: string, options: Record<string, unknown>): unknown;
  clearCookie(name: string, options?: Record<string, unknown>): unknown;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
    private readonly lockout: LoginLockoutService = new LoginLockoutService()
  ) {}

  cookieNames = { access: ACCESS_COOKIE, refresh: REFRESH_COOKIE };

  async register(input: { name: string; email: string; password: string }, response: CookieResponse) {
    const email = input.email.trim().toLowerCase();
    if (!input.name.trim() || !email || input.password.length < 8) {
      throw new BadRequestException("Name, valid email, and password with at least 8 characters are required.");
    }

    const exists = await this.prisma.user.findUnique({ where: { email } });
    if (exists) {
      throw new BadRequestException("An account with this email already exists.");
    }

    const passwordHash = await bcrypt.hash(input.password, 12);
    const verificationToken = this.makeOpaqueToken();
    const user = await this.prisma.user.create({
      data: {
        name: input.name.trim(),
        email,
        passwordHash,
        verificationCodes: {
          create: {
            purpose: "email_verification",
            codeHash: this.hashToken(verificationToken),
            expiresAt: this.minutesFromNow(60 * 24)
          }
        },
        profile: { create: {} }
      }
    });

    const devVerificationLink = await this.mail.sendVerificationEmail(email, verificationToken);
    const tokens = await this.issueSession(user.id, response);
    return {
      user: await this.toAuthUser(user.id),
      emailVerificationRequired: true,
      tokens,
      ...(process.env.SMTP_HOST ? {} : { devVerificationLink })
    };
  }

  async login(input: { email: string; password: string }, response: CookieResponse) {
    const email = input.email.trim().toLowerCase();
    await this.assertNotLocked(email);
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || user.deletedAt) {
      await this.recordLoginFailure(email);
      throw new UnauthorizedException("Invalid email or password.");
    }

    const ok = await bcrypt.compare(input.password, user.passwordHash);
    if (!ok) {
      await this.recordLoginFailure(email);
      throw new UnauthorizedException("Invalid email or password.");
    }

    await this.clearLoginFailures(email);
    await this.prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
    const tokens = await this.issueSession(user.id, response);
    return { user: await this.toAuthUser(user.id), tokens };
  }

  async me(accessToken?: string) {
    const payload = this.verifyAccessToken(accessToken);
    return { user: await this.toAuthUser(payload.sub) };
  }

  async refresh(refreshToken: string | undefined, response: CookieResponse) {
    if (!refreshToken) {
      throw new UnauthorizedException("Missing refresh token.");
    }

    const payload = this.verifyRefreshToken(refreshToken);
    const tokenHash = this.hashToken(refreshToken);
    const session = await this.prisma.session.findUnique({ where: { refreshTokenHash: tokenHash } });
    if (!session || session.revokedAt || session.expiresAt < new Date() || session.userId !== payload.sub) {
      throw new UnauthorizedException("Refresh session is invalid.");
    }

    await this.prisma.session.update({ where: { id: session.id }, data: { revokedAt: new Date() } });
    const tokens = await this.issueSession(payload.sub, response);
    return { user: await this.toAuthUser(payload.sub), tokens };
  }

  async logout(refreshToken: string | undefined, response: CookieResponse) {
    if (refreshToken) {
      await this.prisma.session.updateMany({
        where: { refreshTokenHash: this.hashToken(refreshToken), revokedAt: null },
        data: { revokedAt: new Date() }
      });
    }

    this.clearAuthCookies(response);
    return { ok: true };
  }

  async deleteAccount(accessToken: string | undefined, password: string | undefined, response: CookieResponse) {
    const payload = this.verifyAccessToken(accessToken);
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: payload.sub } });
    if (password) {
      const ok = await bcrypt.compare(password, user.passwordHash);
      if (!ok) {
        throw new UnauthorizedException("Password is incorrect.");
      }
    }

    const deletedEmail = `deleted-${user.id}@deleted.closira.local`;
    await this.prisma.$transaction([
      this.prisma.session.updateMany({ where: { userId: user.id, revokedAt: null }, data: { revokedAt: new Date() } }),
      this.prisma.aiProviderSetting.updateMany({ where: { userId: user.id }, data: { isEnabled: false, encryptedSecret: null } }),
      this.prisma.imageEmbedding.deleteMany({ where: { item: { userId: user.id } } }),
      this.prisma.aiJob.updateMany({ where: { userId: user.id }, data: { status: "FAILED", errorMessage: "Account deleted." } }),
      this.prisma.wardrobeImage.deleteMany({ where: { item: { userId: user.id } } }),
      this.prisma.wardrobeItem.updateMany({ where: { userId: user.id }, data: { status: "DELETED", notes: null } }),
      this.prisma.user.update({
        where: { id: user.id },
        data: {
          deletedAt: new Date(),
          email: deletedEmail,
          name: "Deleted user",
          imageUrl: null
        }
      }),
      this.prisma.auditLog.create({ data: { actorId: user.id, action: "account.deleted", entity: "user", entityId: user.id } })
    ]);
    this.clearAuthCookies(response);
    return { ok: true };
  }

  async forgotPassword(emailInput: string) {
    const email = emailInput.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      return { ok: true };
    }

    const token = this.makeOpaqueToken();
    await this.prisma.passwordReset.create({
      data: {
        userId: user.id,
        tokenHash: this.hashToken(token),
        expiresAt: this.minutesFromNow(30)
      }
    });

    const devResetLink = await this.mail.sendPasswordResetEmail(user.email, token);
    return { ok: true, ...(process.env.SMTP_HOST ? {} : { devResetToken: token, devResetLink }) };
  }

  async resetPassword(input: { token: string; password: string }) {
    if (!input.token || input.password.length < 8) {
      throw new BadRequestException("Reset token and password with at least 8 characters are required.");
    }

    const reset = await this.prisma.passwordReset.findUnique({ where: { tokenHash: this.hashToken(input.token) } });
    if (!reset || reset.usedAt || reset.expiresAt < new Date()) {
      throw new BadRequestException("Password reset token is invalid or expired.");
    }

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: reset.userId },
        data: { passwordHash: await bcrypt.hash(input.password, 12) }
      }),
      this.prisma.passwordReset.update({ where: { id: reset.id }, data: { usedAt: new Date() } }),
      this.prisma.session.updateMany({ where: { userId: reset.userId, revokedAt: null }, data: { revokedAt: new Date() } })
    ]);

    return { ok: true };
  }

  async verifyEmail(input: { token?: string; code?: string; userId?: string }) {
    const value = input.token ?? input.code;
    if (!value) {
      throw new BadRequestException("Verification token is required.");
    }

    const code = await this.prisma.verificationCode.findFirst({
      where: {
        codeHash: this.hashToken(value),
        purpose: "email_verification",
        userId: input.userId,
        usedAt: null,
        expiresAt: { gt: new Date() }
      }
    });

    if (!code) {
      throw new BadRequestException("Email verification token is invalid or expired.");
    }

    await this.prisma.$transaction([
      this.prisma.user.update({ where: { id: code.userId }, data: { emailVerifiedAt: new Date() } }),
      this.prisma.verificationCode.update({ where: { id: code.id }, data: { usedAt: new Date() } })
    ]);

    return { ok: true };
  }

  verifyAccessToken(token: string | undefined): TokenPayload {
    if (!token) {
      throw new UnauthorizedException("Missing access token.");
    }

    for (const secret of this.accessSecrets()) {
      try {
        return jwt.verify(token, secret) as TokenPayload;
      } catch {
        continue;
      }
    }
    throw new UnauthorizedException("Access token is invalid or expired.");
  }

  private verifyRefreshToken(token: string): TokenPayload {
    for (const secret of this.refreshSecrets()) {
      try {
        return jwt.verify(token, secret) as TokenPayload;
      } catch {
        continue;
      }
    }
    throw new UnauthorizedException("Refresh token is invalid or expired.");
  }

  private async issueSession(userId: string, response: CookieResponse) {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    const payload: TokenPayload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = jwt.sign(payload, this.accessSecret(), { expiresIn: ACCESS_TTL_SECONDS });
    const refreshToken = jwt.sign(payload, this.refreshSecret(), { expiresIn: REFRESH_TTL_SECONDS });

    await this.prisma.session.create({
      data: {
        userId,
        refreshTokenHash: this.hashToken(refreshToken),
        expiresAt: new Date(Date.now() + REFRESH_TTL_SECONDS * 1000)
      }
    });

    const secure = process.env.NODE_ENV === "production";
    response.cookie(ACCESS_COOKIE, accessToken, {
      httpOnly: true,
      secure,
      sameSite: "lax",
      path: "/",
      maxAge: ACCESS_TTL_SECONDS * 1000
    });
    response.cookie(REFRESH_COOKIE, refreshToken, {
      httpOnly: true,
      secure,
      sameSite: "lax",
      path: "/",
      maxAge: REFRESH_TTL_SECONDS * 1000
    });
    response.cookie(csrfCookieName, this.makeOpaqueToken(), {
      httpOnly: false,
      secure,
      sameSite: "lax",
      path: "/",
      maxAge: REFRESH_TTL_SECONDS * 1000
    });

    return {
      accessToken,
      refreshToken,
      accessTokenExpiresInSeconds: ACCESS_TTL_SECONDS,
      refreshTokenExpiresInSeconds: REFRESH_TTL_SECONDS
    };
  }

  private clearAuthCookies(response: CookieResponse) {
    response.clearCookie(ACCESS_COOKIE, { path: "/" });
    response.clearCookie(REFRESH_COOKIE, { path: "/" });
    response.clearCookie(csrfCookieName, { path: "/" });
  }

  private async toAuthUser(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      include: { _count: { select: { wardrobeItems: true } } }
    });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role === "USER" ? "user" : "admin",
      emailVerified: Boolean(user.emailVerifiedAt),
      wardrobeItemCount: user._count.wardrobeItems
    };
  }

  private hashToken(token: string) {
    return createHash("sha256").update(token).digest("hex");
  }

  private makeOpaqueToken() {
    return randomBytes(32).toString("base64url");
  }

  private minutesFromNow(minutes: number) {
    return new Date(Date.now() + minutes * 60 * 1000);
  }

  private accessSecret() {
    return process.env.JWT_ACCESS_SECRET ?? "local-access-secret-change-me";
  }

  private refreshSecret() {
    return process.env.JWT_REFRESH_SECRET ?? "local-refresh-secret-change-me";
  }

  private accessSecrets() {
    return [this.accessSecret(), process.env.JWT_PREVIOUS_ACCESS_SECRET].filter(Boolean) as string[];
  }

  private refreshSecrets() {
    return [this.refreshSecret(), process.env.JWT_PREVIOUS_REFRESH_SECRET].filter(Boolean) as string[];
  }

  private async assertNotLocked(email: string) {
    if (await this.lockout.isLocked(email)) {
      throw new UnauthorizedException("Too many failed login attempts. Try again later.");
    }
  }

  private async recordLoginFailure(email: string) {
    await this.lockout.recordFailure(email);
  }

  private async clearLoginFailures(email: string) {
    await this.lockout.clear(email);
  }
}
