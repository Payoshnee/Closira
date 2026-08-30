import { UserRole } from "@prisma/client";
import { MailService } from "../mail/mail.service";
import { PrismaService } from "../prisma.service";
import { LoginLockoutService } from "./login-lockout.service";
type TokenPayload = {
    sub: string;
    email: string;
    role: UserRole;
};
type CookieResponse = {
    cookie(name: string, value: string, options: Record<string, unknown>): unknown;
    clearCookie(name: string, options?: Record<string, unknown>): unknown;
};
export declare class AuthService {
    private readonly prisma;
    private readonly mail;
    private readonly lockout;
    constructor(prisma: PrismaService, mail: MailService, lockout?: LoginLockoutService);
    cookieNames: {
        access: string;
        refresh: string;
    };
    register(input: {
        name: string;
        email: string;
        password: string;
    }, response: CookieResponse): Promise<{
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
    login(input: {
        email: string;
        password: string;
    }, response: CookieResponse): Promise<{
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
    me(accessToken?: string): Promise<{
        user: {
            id: string;
            name: string;
            email: string;
            role: string;
            emailVerified: boolean;
            wardrobeItemCount: number;
        };
    }>;
    refresh(refreshToken: string | undefined, response: CookieResponse): Promise<{
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
    logout(refreshToken: string | undefined, response: CookieResponse): Promise<{
        ok: boolean;
    }>;
    deleteAccount(accessToken: string | undefined, password: string | undefined, response: CookieResponse): Promise<{
        ok: boolean;
    }>;
    forgotPassword(emailInput: string): Promise<{
        devResetToken?: string | undefined;
        devResetLink?: string | undefined;
        ok: boolean;
    }>;
    resetPassword(input: {
        token: string;
        password: string;
    }): Promise<{
        ok: boolean;
    }>;
    verifyEmail(input: {
        token?: string;
        code?: string;
        userId?: string;
    }): Promise<{
        ok: boolean;
    }>;
    verifyAccessToken(token: string | undefined): TokenPayload;
    private verifyRefreshToken;
    private issueSession;
    private clearAuthCookies;
    private toAuthUser;
    private hashToken;
    private makeOpaqueToken;
    private minutesFromNow;
    private accessSecret;
    private refreshSecret;
    private accessSecrets;
    private refreshSecrets;
    private assertNotLocked;
    private recordLoginFailure;
    private clearLoginFailures;
}
export {};
