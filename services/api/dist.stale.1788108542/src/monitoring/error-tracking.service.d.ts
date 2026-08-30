type ErrorTrackingPayload = {
    requestId?: string;
    method?: string;
    path?: string;
    statusCode: number;
    message: string;
    stack?: string;
    timestamp: string;
};
export declare class ErrorTrackingService {
    private readonly logger;
    capture(payload: ErrorTrackingPayload): Promise<void>;
}
export {};
