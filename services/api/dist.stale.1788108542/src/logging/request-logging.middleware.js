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
var RequestLoggingMiddleware_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestLoggingMiddleware = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const metrics_service_1 = require("../monitoring/metrics.service");
let RequestLoggingMiddleware = RequestLoggingMiddleware_1 = class RequestLoggingMiddleware {
    metrics;
    logger = new common_1.Logger(RequestLoggingMiddleware_1.name);
    constructor(metrics) {
        this.metrics = metrics;
    }
    use(request, response, next) {
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
            }
            else if (response.statusCode >= 400) {
                this.logger.warn(JSON.stringify(event));
            }
            else {
                this.logger.log(JSON.stringify(event));
            }
        });
        next();
    }
};
exports.RequestLoggingMiddleware = RequestLoggingMiddleware;
exports.RequestLoggingMiddleware = RequestLoggingMiddleware = RequestLoggingMiddleware_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [metrics_service_1.MetricsService])
], RequestLoggingMiddleware);
function readRequestId(request) {
    const incoming = request.headers["x-request-id"];
    if (Array.isArray(incoming)) {
        return incoming[0] || (0, crypto_1.randomUUID)();
    }
    return incoming || (0, crypto_1.randomUUID)();
}
//# sourceMappingURL=request-logging.middleware.js.map