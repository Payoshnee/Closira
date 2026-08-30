import { PrismaService } from "./prisma.service";
type DependencyCheck = {
    status: "ok" | "error" | "skipped";
    latencyMs?: number;
    message?: string;
};
export declare class HealthController {
    private readonly prisma?;
    constructor(prisma?: PrismaService | undefined);
    getHealth(): {
        status: string;
        service: string;
        uptimeSeconds: number;
        timestamp: string;
    };
    getLive(): {
        status: string;
        service: string;
        uptimeSeconds: number;
        timestamp: string;
    };
    getReady(): Promise<{
        status: string;
        service: string;
        checks: {
            database: DependencyCheck;
            redis: DependencyCheck;
            aiService: DependencyCheck;
        };
        timestamp: string;
    }>;
    private checkDatabase;
    private checkRedis;
    private checkAiService;
}
export {};
