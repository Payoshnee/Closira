export declare class LoginLockoutService {
    private readonly logger;
    private redis?;
    isLocked(email: string): Promise<boolean>;
    recordFailure(email: string): Promise<void>;
    clear(email: string): Promise<void>;
    private read;
    private write;
    private client;
}
