import type { Request, Response } from "express";
import { AuthService } from "./auth.service";
export declare class AuthController {
    private readonly auth;
    constructor(auth: AuthService);
    register(body: {
        name: string;
        email: string;
        password: string;
    }, response: Response): Promise<{
        devVerificationLink?: string | undefined;
        user: {
            id: string;
            name: string;
            email: string;
            role: string;
            emailVerified: boolean;
            wardrobeItemCount: number;
        };
        emailVerificationRequired: boolean;
        tokens: {
            accessToken: string;
            refreshToken: string;
            accessTokenExpiresInSeconds: number;
            refreshTokenExpiresInSeconds: number;
        };
    }>;
    login(body: {
        email: string;
        password: string;
    }, response: Response): Promise<{
        user: {
            id: string;
            name: string;
            email: string;
            role: string;
            emailVerified: boolean;
            wardrobeItemCount: number;
        };
        tokens: {
            accessToken: string;
            refreshToken: string;
            accessTokenExpiresInSeconds: number;
            refreshTokenExpiresInSeconds: number;
        };
    }>;
    logout(request: Request, response: Response): Promise<{
        ok: boolean;
    }>;
    deleteAccount(request: Request, body: {
        password?: string;
    }, response: Response): Promise<{
        ok: boolean;
    }>;
    refresh(request: Request, response: Response): Promise<{
        user: {
            id: string;
            name: string;
            email: string;
            role: string;
            emailVerified: boolean;
            wardrobeItemCount: number;
        };
        tokens: {
            accessToken: string;
            refreshToken: string;
            accessTokenExpiresInSeconds: number;
            refreshTokenExpiresInSeconds: number;
        };
    }>;
    me(request: Request): Promise<{
        user: {
            id: string;
            name: string;
            email: string;
            role: string;
            emailVerified: boolean;
            wardrobeItemCount: number;
        };
    }>;
    forgotPassword(body: {
        email: string;
    }): Promise<{
        devResetToken?: string | undefined;
        devResetLink?: string | undefined;
        ok: boolean;
    }>;
    resetPassword(body: {
        token: string;
        password: string;
    }): Promise<{
        ok: boolean;
    }>;
    verifyEmail(body: {
        token?: string;
        code?: string;
        userId?: string;
    }): Promise<{
        ok: boolean;
    }>;
    private cookies;
    private bearer;
}
