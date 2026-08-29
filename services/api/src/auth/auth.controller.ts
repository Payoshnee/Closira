import { Body, Controller, Get, Post, Req, Res } from "@nestjs/common";
import type { Request, Response } from "express";
import { AuthService } from "./auth.service";

type AuthCookies = {
  closira_access?: string;
  closira_refresh?: string;
};

@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post("register")
  register(@Body() body: { name: string; email: string; password: string }, @Res({ passthrough: true }) response: Response) {
    return this.auth.register(body, response);
  }

  @Post("login")
  login(@Body() body: { email: string; password: string }, @Res({ passthrough: true }) response: Response) {
    return this.auth.login(body, response);
  }

  @Post("logout")
  logout(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    return this.auth.logout(this.cookies(request).closira_refresh, response);
  }

  @Post("refresh")
  refresh(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    return this.auth.refresh(this.cookies(request).closira_refresh, response);
  }

  @Get("me")
  me(@Req() request: Request) {
    const authHeader = request.headers.authorization;
    const bearer = authHeader?.startsWith("Bearer ") ? authHeader.slice("Bearer ".length) : undefined;
    return this.auth.me(bearer ?? this.cookies(request).closira_access);
  }

  @Post("forgot-password")
  forgotPassword(@Body() body: { email: string }) {
    return this.auth.forgotPassword(body.email);
  }

  @Post("reset-password")
  resetPassword(@Body() body: { token: string; password: string }) {
    return this.auth.resetPassword(body);
  }

  @Post("verify-email")
  verifyEmail(@Body() body: { token?: string; code?: string; userId?: string }) {
    return this.auth.verifyEmail(body);
  }

  private cookies(request: Request) {
    return (request.cookies ?? {}) as AuthCookies;
  }
}
