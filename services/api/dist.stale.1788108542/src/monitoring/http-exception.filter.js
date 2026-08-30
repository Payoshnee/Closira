"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var HttpExceptionFilter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
const error_tracking_service_1 = require("./error-tracking.service");
let HttpExceptionFilter = HttpExceptionFilter_1 = class HttpExceptionFilter {
    errorTracking;
    logger = new common_1.Logger(HttpExceptionFilter_1.name);
    constructor(errorTracking) {
        this.errorTracking = errorTracking;
    }
    catch(exception, host) {
        const context = host.switchToHttp();
        const request = context.getRequest();
        const response = context.getResponse();
        const statusCode = exception instanceof common_1.HttpException ? exception.getStatus() : common_1.HttpStatus.INTERNAL_SERVER_ERROR;
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
};
exports.HttpExceptionFilter = HttpExceptionFilter;
exports.HttpExceptionFilter = HttpExceptionFilter = HttpExceptionFilter_1 = __decorate([
    (0, common_1.Catch)(),
    __metadata("design:paramtypes", [error_tracking_service_1.ErrorTrackingService])
], HttpExceptionFilter);
function readExceptionMessage(exception) {
    if (exception instanceof common_1.HttpException) {
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
//# sourceMappingURL=http-exception.filter.js.map