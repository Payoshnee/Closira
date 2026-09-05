import { Injectable } from "@nestjs/common";

type RouteMetric = {
  count: number;
  totalDurationMs: number;
};

@Injectable()
export class MetricsService {
  private readonly startedAt = new Date();
  private readonly requests = new Map<string, RouteMetric>();

  recordRequest(method: string, path: string, statusCode: number, durationMs: number) {
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
      "# HELP clorisa_api_up API process liveness.",
      "# TYPE clorisa_api_up gauge",
      "clorisa_api_up 1",
      "# HELP clorisa_api_uptime_seconds API process uptime in seconds.",
      "# TYPE clorisa_api_uptime_seconds gauge",
      `clorisa_api_uptime_seconds ${Math.round(process.uptime())}`,
      "# HELP clorisa_api_started_at Unix timestamp when the API process started.",
      "# TYPE clorisa_api_started_at gauge",
      `clorisa_api_started_at ${Math.floor(this.startedAt.getTime() / 1000)}`,
      "# HELP clorisa_api_http_requests_total HTTP requests grouped by method, route, and status class.",
      "# TYPE clorisa_api_http_requests_total counter"
    ];

    for (const [key, metric] of this.requests.entries()) {
      const [method, route, statusGroup] = key.split(" ");
      lines.push(`clorisa_api_http_requests_total{method="${method}",route="${route}",status="${statusGroup}"} ${metric.count}`);
    }

    lines.push(
      "# HELP clorisa_api_http_request_duration_ms_sum Total request duration in milliseconds.",
      "# TYPE clorisa_api_http_request_duration_ms_sum counter"
    );

    for (const [key, metric] of this.requests.entries()) {
      const [method, route, statusGroup] = key.split(" ");
      lines.push(`clorisa_api_http_request_duration_ms_sum{method="${method}",route="${route}",status="${statusGroup}"} ${Math.round(metric.totalDurationMs)}`);
    }

    return `${lines.join("\n")}\n`;
  }
}

function normalizePath(path: string) {
  return path
    .split("?")[0]
    .replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, ":id")
    .replace(/\/\d+(?=\/|$)/g, "/:id");
}
