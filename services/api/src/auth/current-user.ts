import { ForbiddenException, UnauthorizedException } from "@nestjs/common";
import type { Request } from "express";
import { AuthService } from "./auth.service";

export type CurrentUser = {
  id: string;
  email: string;
  role: string;
};

type AuthCookies = {
  closira_access?: string;
};

export function requireCurrentUser(request: Request, auth: AuthService): CurrentUser {
  const authHeader = request.headers.authorization;
  const bearer = authHeader?.startsWith("Bearer ") ? authHeader.slice("Bearer ".length) : undefined;
  const cookies = (request.cookies ?? {}) as AuthCookies;
  const payload = auth.verifyAccessToken(bearer ?? cookies.closira_access);

  if (!payload.sub) {
    throw new UnauthorizedException("Authenticated user is required.");
  }

  return { id: payload.sub, email: payload.email, role: payload.role };
}

export function requireAdminUser(request: Request, auth: AuthService): CurrentUser {
  const user = requireCurrentUser(request, auth);
  if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
    throw new ForbiddenException("Admin access is required.");
  }
  return user;
}
