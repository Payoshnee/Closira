import { MetricsService } from "./metrics.service";
export declare class MetricsController {
    private readonly metrics;
    constructor(metrics: MetricsService);
    getMetrics(): string;
}
