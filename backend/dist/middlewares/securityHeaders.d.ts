import { Request, Response, NextFunction } from 'express';
export declare class SecurityHeaders {
    /**
     * Set comprehensive security headers
     */
    static setSecurityHeaders: (req: import("http").IncomingMessage, res: import("http").ServerResponse, next: (err?: unknown) => void) => void;
    /**
     * Configure helmet with default security settings
     */
    static configureHelmet: () => (req: import("http").IncomingMessage, res: import("http").ServerResponse, next: (err?: unknown) => void) => void;
    /**
     * Apply security headers middleware
     */
    static applySecurityHeaders: (req: import("http").IncomingMessage, res: import("http").ServerResponse, next: (err?: unknown) => void) => void;
    /**
     * API-specific security headers
     */
    static apiSecurityHeaders: (req: import("http").IncomingMessage, res: import("http").ServerResponse, next: (err?: unknown) => void) => void;
    /**
     * File upload specific headers
     */
    static fileUploadHeaders: (req: import("http").IncomingMessage, res: import("http").ServerResponse, next: (err?: unknown) => void) => void;
    /**
     * Configure CORS settings
     */
    static configureCORS: () => {
        origin: string[];
        credentials: boolean;
        methods: string[];
        allowedHeaders: string[];
    };
    /**
     * Add custom security headers
     */
    static addCustomHeaders: (req: Request, res: Response, next: NextFunction) => void;
}
//# sourceMappingURL=securityHeaders.d.ts.map