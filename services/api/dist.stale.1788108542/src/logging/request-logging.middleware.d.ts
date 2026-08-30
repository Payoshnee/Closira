import { NestMiddleware } from "@nestjs/common";
import type { NextFunction, Request, Response } from "express";
import { MetricsService } from "../monitoring/metrics.service";
export declare class RequestLoggingMiddleware implements NestMiddleware {
    private readonly metrics;
    private readonly logger;
    constructor(metrics: MetricsService);
    use(request: RequestWithRequestId, response: Response, next: NextFunction): void;
}
export type RequestWithRequestId = Request & {
    requestId?: string;
};
