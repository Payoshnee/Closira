import { ForbiddenException, Injectable, NestMiddleware } from "@nestjs/common";
import type { NextFunction, Request, Response } from "express";

const CSRF_COOKIE = "clorisa_csrf";
const CSRF_HEADER = "x-csrf-token";
const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);
const PUBLIC_AUTH_PATHS = new Set([
  "/api/v1/auth/login",
  "/api/v1/auth/register",
  "/api/v1/auth/forgot-password",
  "/api/v1/auth/reset-password",
  "/api/v1/auth/verify-email"
]);

@Injectable()
export class CsrfMiddleware implements NestMiddleware {
  use(request: Request, _response: Response, next: NextFunction) {
    if (SAFE_METHODS.has(request.method) || PUBLIC_AUTH_PATHS.has(request.path)) {
      next();
      return;
    }

    const hasAuthCookie = Boolean(request.cookies?.clorisa_access || request.cookies?.clorisa_refresh);
    if (!hasAuthCookie) {
      next();
      return;
    }

    const cookieToken = request.cookies?.[CSRF_COOKIE];
    const headerToken = request.headers[CSRF_HEADER];
    const submittedToken = Array.isArray(headerToken) ? headerToken[0] : headerToken;

    if (!cookieToken || !submittedToken || cookieToken !== submittedToken) {
      throw new ForbiddenException("Invalid or missing CSRF token.");
    }

    next();
  }
}

export const csrfCookieName = CSRF_COOKIE;
export const csrfHeaderName = CSRF_HEADER;
