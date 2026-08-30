import { ArgumentsHost, ExceptionFilter } from "@nestjs/common";
import { ErrorTrackingService } from "./error-tracking.service";
export declare class HttpExceptionFilter implements ExceptionFilter {
    private readonly errorTracking;
    private readonly logger;
    constructor(errorTracking: ErrorTrackingService);
    catch(exception: unknown, host: ArgumentsHost): void;
}
