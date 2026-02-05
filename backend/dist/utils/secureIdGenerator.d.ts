/**
 * Secure ID generation utilities
 */
export declare class SecureIdGenerator {
    /**
     * Generate cryptographically secure PLN reference ID
     * Format: PLN-{YYYY}-{SecureRandom12}
     */
    static generatePLNReferenceId(): string;
    /**
     * Generate cryptographically secure Vehicle Registration reference ID
     * Format: VREG-{YYYY}-{SecureRandom12}
     */
    static generateVehicleRegReferenceId(): string;
    /**
     * Generate secure tracking token (for additional security layer)
     */
    static generateTrackingToken(): string;
    /**
     * Generate secure file upload token
     */
    static generateFileUploadToken(): string;
    /**
     * Generate CSRF token
     */
    static generateCSRFToken(): string;
    /**
     * Generate secure session ID
     */
    static generateSessionId(): string;
    /**
     * Hash sensitive data for storage
     */
    static hashSensitiveData(data: string, salt?: string): {
        hash: string;
        salt: string;
    };
    /**
     * Verify hashed data
     */
    static verifyHashedData(data: string, hash: string, salt: string): boolean;
    /**
     * Generate secure API key
     */
    static generateAPIKey(): string;
    /**
     * Validate reference ID format
     */
    static validateReferenceId(referenceId: string): boolean;
    /**
     * Generate one-time verification code
     */
    static generateVerificationCode(): string;
    /**
     * Generate secure temporary password
     */
    static generateTemporaryPassword(): string;
}
//# sourceMappingURL=secureIdGenerator.d.ts.map