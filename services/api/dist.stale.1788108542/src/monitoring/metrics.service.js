"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricsService = void 0;
const common_1 = require("@nestjs/common");
let MetricsService = class MetricsService {
    startedAt = new Date();
    requests = new Map();
    recordRequest(method, path, statusCode, durationMs) {
        const route = normalizePath(path);
        const statusGroup = `${Math.floor(statusCode / 100)}xx`;
        const key = `${method.toUpperCase()} ${route} ${statusGroup}`;
        const current = this.requests.get(key) ?? { count: 0, totalDurationMs: 0 };
        current.count += 1;
        current.totalDurationMs += durationMs;
        this.requests.set(key, current);
    }
    renderPrometheus() {
        const lines = [
            "# HELP closira_api_up API process liveness.",
            "# TYPE closira_api_up gauge",
            "closira_api_up 1",
            "# HELP closira_api_uptime_seconds API process uptime in seconds.",
            "# TYPE closira_api_uptime_seconds gauge",
            `closira_api_uptime_seconds ${Math.round(process.uptime())}`,
            "# HELP closira_api_started_at Unix timestamp when the API process started.",
            "# TYPE closira_api_started_at gauge",
            `closira_api_started_at ${Math.floor(this.startedAt.getTime() / 1000)}`,
            "# HELP closira_api_http_requests_total HTTP requests grouped by method, route, and status class.",
            "# TYPE closira_api_http_requests_total counter"
        ];
        for (const [key, metric] of this.requests.entries()) {
            const [method, route, statusGroup] = key.split(" ");
            lines.push(`closira_api_http_requests_total{method="${method}",route="${route}",status="${statusGroup}"} ${metric.count}`);
        }
        lines.push("# HELP closira_api_http_request_duration_ms_sum Total request duration in milliseconds.", "# TYPE closira_api_http_request_duration_ms_sum counter");
        for (const [key, metric] of this.requests.entries()) {
            const [method, route, statusGroup] = key.split(" ");
            lines.push(`closira_api_http_request_duration_ms_sum{method="${method}",route="${route}",status="${statusGroup}"} ${Math.round(metric.totalDurationMs)}`);
        }
        return `${lines.join("\n")}\n`;
    }
};
exports.MetricsService = MetricsService;
exports.MetricsService = MetricsService = __decorate([
    (0, common_1.Injectable)()
], MetricsService);
function normalizePath(path) {
    return path
        .split("?")[0]
        .replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, ":id")
        .replace(/\/\d+(?=\/|$)/g, "/:id");
}
//# sourceMappingURL=metrics.service.js.map