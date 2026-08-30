import { MetricsService } from "./metrics.service";

describe("MetricsService", () => {
  it("renders Prometheus metrics for recorded requests", () => {
    const service = new MetricsService();

    service.recordRequest("GET", "/api/v1/wardrobe/123e4567-e89b-12d3-a456-426614174000?tab=detail", 200, 12.4);
    const metrics = service.renderPrometheus();

    expect(metrics).toContain("closira_api_up 1");
    expect(metrics).toContain('closira_api_http_requests_total{method="GET",route="/api/v1/wardrobe/:id",status="2xx"} 1');
    expect(metrics).toContain('closira_api_http_request_duration_ms_sum{method="GET",route="/api/v1/wardrobe/:id",status="2xx"} 12');
  });
});
