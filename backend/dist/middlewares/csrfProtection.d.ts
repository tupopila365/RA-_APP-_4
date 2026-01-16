import { Request, Response, NextFunction } from 'express';
/**
 * CSRF Protection middleware
 */
export declare class CSRFProtection {
    private static readonly CSRF_TOKEN_HEADER;
    private static readonly CSRF_COOKIE_NAME;
    private static readonly TOKEN_EXPIRY;
    private static tokenStore;
    /**
     * Generate CSRF token for a session
     */
    static generateToken(req: Request): string;
    /**
     * Get session ID from request
     */
    private static getSessionId;
    /**
     * Clean up expired tokens
     */
    private static cleanupExpiredTokens;
    /**
     * Validate CSRF token
     */
    private static validateToken;
    /**
     * Middleware to provide CSRF token
     */
    static provideToken: (req: Request, res: Response, next: NextFunction) => void;
    /**
     * Middleware to validate CSRF token
     */
    static validateCSRF: (req: Request, res: Response, next: NextFunction) => void;
    /**
     * Middleware for PLN form submissions (combines token provision and validation)
     */
    static protectPLNSubmission: (req: Request, res: Response, next: NextFunction) => void;
    /**
     * Get CSRF token for client-side usage
     */
    static getTokenForClient: (req: Request, res: Response) => void;
}
//# sourceMappingURL=csrfProtection.d.ts.map