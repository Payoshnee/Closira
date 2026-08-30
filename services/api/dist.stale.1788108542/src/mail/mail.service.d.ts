export declare class MailService {
    private readonly logger;
    sendVerificationEmail(to: string, token: string): Promise<string>;
    sendPasswordResetEmail(to: string, token: string): Promise<string>;
    private send;
}
