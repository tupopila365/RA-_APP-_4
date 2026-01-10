declare class EmailService {
    private transporter;
    constructor();
    private initializeTransporter;
    /**
     * Send email
     */
    private sendEmail;
    /**
     * Send email verification email
     */
    sendVerificationEmail(email: string, fullName: string | undefined, token: string): Promise<void>;
    /**
     * Send password reset email (for future use)
     */
    sendPasswordResetEmail(email: string, fullName: string | undefined, token: string): Promise<void>;
    /**
     * Send welcome email after email verification
     */
    sendWelcomeEmail(email: string, fullName: string | undefined): Promise<void>;
}
export declare const emailService: EmailService;
export {};
//# sourceMappingURL=email.service.d.ts.map