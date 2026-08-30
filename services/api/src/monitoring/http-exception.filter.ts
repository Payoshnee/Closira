import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from "@nestjs/common";
import type { Response } from "express";
import type { RequestWithRequestId } from "../logging/request-logging.middleware";
import { ErrorTrackingService } from "./error-tracking.service";

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  constructor(private readonly errorTracking: ErrorTrackingService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const request = context.getRequest<RequestWithRequestId>();
    const response = context.getResponse<Response>();
    const statusCode = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const message = readExceptionMessage(exception);
    const payload = {
      statusCode,
      message,
      timestamp: new Date().toISOString(),
      path: request.originalUrl,
      method: request.method,
      requestId: request.requestId
    };

    if (statusCode >= 500) {
      this.logger.error(JSON.stringify(payload), exception instanceof Error ? exception.stack : undefined);
      void this.errorTracking.capture({
        ...payload,
        stack: exception instanceof Error ? exception.stack : undefined
      });
    }

    response.status(statusCode).json({
      statusCode,
      message,
      requestId: request.requestId,
      timestamp: payload.timestamp,
      path: request.originalUrl
    });
  }
}

function readExceptionMessage(exception: unknown) {
  if (exception instanceof HttpException) {
    const response = exception.getResponse();
    if (typeof response === "string") {
      return response;
    }

    if (typeof response === "object" && response && "message" in response) {
      const message = response.message;
      return Array.isArray(message) ? message.join(", ") : String(message);
    }
  }

  return exception instanceof Error ? exception.message : "Internal server error";
}
