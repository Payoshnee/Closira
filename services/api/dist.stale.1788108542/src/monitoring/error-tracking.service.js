"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ErrorTrackingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorTrackingService = void 0;
const common_1 = require("@nestjs/common");
let ErrorTrackingService = ErrorTrackingService_1 = class ErrorTrackingService {
    logger = new common_1.Logger(ErrorTrackingService_1.name);
    async capture(payload) {
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
                    service: "closira-api",
                    environment: process.env.NODE_ENV ?? "development",
                    ...payload
                })
            });
        }
        catch (error) {
            this.logger.warn(`Failed to send error tracking event: ${readErrorMessage(error)}`);
        }
    }
};
exports.ErrorTrackingService = ErrorTrackingService;
exports.ErrorTrackingService = ErrorTrackingService = ErrorTrackingService_1 = __decorate([
    (0, common_1.Injectable)()
], ErrorTrackingService);
function readErrorMessage(error) {
    return error instanceof Error ? error.message : "Unknown error";
}
//# sourceMappingURL=error-tracking.service.js.map