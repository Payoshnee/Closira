import { Body, Controller, Delete, Get, Post, Req, Res } from "@nestjs/common";
import type { Request, Response } from "express";
import { AuthService } from "./auth.service";

type AuthCookies = {
  clorisa_access?: string;
  clorisa_refresh?: string;
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
    return this.auth.logout(this.bearer(request) ?? this.cookies(request).clorisa_refresh, response);
  }

  @Delete("account")
  deleteAccount(@Req() request: Request, @Body() body: { password?: string }, @Res({ passthrough: true }) response: Response) {
    return this.auth.deleteAccount(this.bearer(request) ?? this.cookies(request).clorisa_access, body.password, response);
  }

  @Post("refresh")
  refresh(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    return this.auth.refresh(this.bearer(request) ?? this.cookies(request).clorisa_refresh, response);
  }

  @Get("me")
  me(@Req() request: Request) {
    return this.auth.me(this.bearer(request) ?? this.cookies(request).clorisa_access);
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

  private bearer(request: Request) {
    const authHeader = request.headers.authorization;
    return authHeader?.startsWith("Bearer ") ? authHeader.slice("Bearer ".length) : undefined;
  }
}
