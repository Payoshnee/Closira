import { Injectable, Logger } from "@nestjs/common";

type ErrorTrackingPayload = {
  requestId?: string;
  method?: string;
  path?: string;
  statusCode: number;
  message: string;
  stack?: string;
  timestamp: string;
};

@Injectable()
export class ErrorTrackingService {
  private readonly logger = new Logger(ErrorTrackingService.name);

  async capture(payload: ErrorTrackingPayload) {
    const webhookUrl = process.env.ERROR_TRACKING_WEBHOOK_URL;
    if (!webhookUrl) {
      return;
    }

    try {
      await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(process.env.ERROR_TRACKING_WEBHOOK_TOKEN ? { Authorization: `Bearer ${process.env.ERROR_TRACKING_WEBHOOK_TOKEN}` } : {})
        },
        body: JSON.stringify({
          service: "clorisa-api",
          environment: process.env.NODE_ENV ?? "development",
          ...payload
        })
      });
    } catch (error) {
      this.logger.warn(`Failed to send error tracking event: ${readErrorMessage(error)}`);
    }
  }
}

function readErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown error";
}
