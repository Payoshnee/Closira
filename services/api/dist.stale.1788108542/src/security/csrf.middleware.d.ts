import { NestMiddleware } from "@nestjs/common";
import type { NextFunction, Request, Response } from "express";
export declare class CsrfMiddleware implements NestMiddleware {
    use(request: Request, _response: Response, next: NextFunction): void;
}
export declare const csrfCookieName = "closira_csrf";
export declare const csrfHeaderName = "x-csrf-token";
