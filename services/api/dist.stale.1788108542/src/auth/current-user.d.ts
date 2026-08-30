import type { Request } from "express";
import { AuthService } from "./auth.service";
export type CurrentUser = {
    id: string;
    email: string;
    role: string;
};
export declare function requireCurrentUser(request: Request, auth: AuthService): CurrentUser;
export declare function requireAdminUser(request: Request, auth: AuthService): CurrentUser;
