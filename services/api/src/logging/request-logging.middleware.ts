import { Injectable, Logger, NestMiddleware } from "@nestjs/common";
import { randomUUID } from "crypto";
import type { NextFunction, Request, Response } from "express";
import { MetricsService } from "../monitoring/metrics.service";

@Injectable()
export class RequestLoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger(RequestLoggingMiddleware.name);

  constructor(private readonly metrics: MetricsService) {}

  use(request: RequestWithRequestId, response: Response, next: NextFunction) {
    const startedAt = process.hrtime.bigint();
    const requestId = readRequestId(request);
    request.requestId = requestId;
    response.setHeader("X-Request-Id", requestId);

    response.on("finish", () => {
      const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;
      this.metrics.recordRequest(request.method, request.originalUrl, response.statusCode, durationMs);
      const event = {
        event: "http_request",
        requestId,
        method: request.method,
        path: request.originalUrl,
        statusCode: response.statusCode,
        durationMs: Math.round(durationMs),
        ip: request.ip,
        userAgent: request.headers["user-agent"] ?? null
      };

      if (response.statusCode >= 500) {
        this.logger.error(JSON.stringify(event));
      } else if (response.statusCode >= 400) {
        this.logger.warn(JSON.stringify(event));
      } else {
        this.logger.log(JSON.stringify(event));
      }
    });

    next();
  }
}

export type RequestWithRequestId = Request & {
  requestId?: string;
};

function readRequestId(request: Request) {
  const incoming = request.headers["x-request-id"];
  if (Array.isArray(incoming)) {
    return incoming[0] || randomUUID();
  }

  return incoming || randomUUID();
}
