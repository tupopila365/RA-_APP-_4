import { Request, Response } from 'express';
/**
 * Rate limiting configurations for different endpoints
 */
export declare const generalRateLimit: import("express-rate-limit").RateLimitRequestHandler;
export declare const plnSubmissionRateLimit: import("express-rate-limit").RateLimitRequestHandler;
export declare const trackingRateLimit: import("express-rate-limit").RateLimitRequestHandler;
export declare const fileUploadRateLimit: import("express-rate-limit").RateLimitRequestHandler;
export declare const authRateLimit: import("express-rate-limit").RateLimitRequestHandler;
export declare const suspiciousActivitySlowDown: import("express-rate-limit").RateLimitRequestHandler;
export declare class AdvancedRateLimiter {
    private redis;
    constructor(redisClient?: any);
    /**
     * Check if IP is in suspicious activity list
     */
    isSuspiciousIP(ip: string): Promise<boolean>;
    /**
     * Mark IP as suspicious
     */
    markSuspiciousActivity(ip: string): Promise<void>;
    /**
     * Custom rate limiter middleware
     */
    createCustomRateLimit(options: {
        windowMs: number;
        max: number;
        keyGenerator?: (req: Request) => string;
        skipIf?: (req: Request) => boolean;
    }): (req: Request, res: Response, next: Function) => Promise<any>;
}
export declare const rateLimiters: {
    general: import("express-rate-limit").RateLimitRequestHandler;
    plnSubmission: import("express-rate-limit").RateLimitRequestHandler;
    tracking: import("express-rate-limit").RateLimitRequestHandler;
    fileUpload: import("express-rate-limit").RateLimitRequestHandler;
    auth: import("express-rate-limit").RateLimitRequestHandler;
    slowDown: import("express-rate-limit").RateLimitRequestHandler;
};
//# sourceMappingURL=rateLimiting.d.ts.map