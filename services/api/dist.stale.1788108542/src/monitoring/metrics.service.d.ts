export declare class MetricsService {
    private readonly startedAt;
    private readonly requests;
    recordRequest(method: string, path: string, statusCode: number, durationMs: number): void;
    renderPrometheus(): string;
}
