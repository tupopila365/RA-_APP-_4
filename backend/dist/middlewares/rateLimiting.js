"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateLimiters = exports.AdvancedRateLimiter = exports.suspiciousActivitySlowDown = exports.authRateLimit = exports.fileUploadRateLimit = exports.trackingRateLimit = exports.plnSubmissionRateLimit = exports.generalRateLimit = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const express_slow_down_1 = __importDefault(require("express-slow-down"));
/**
 * Rate limiting configurations for different endpoints
 */
// General API rate limiting
exports.generalRateLimit = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        success: false,
        error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many requests from this IP, please try again later.',
        },
        timestamp: new Date().toISOString(),
    },
    standardHeaders: true,
    legacyHeaders: false,
});
// Strict rate limiting for PLN submissions
exports.plnSubmissionRateLimit = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // Limit each IP to 5 PLN submissions per hour
    message: {
        success: false,
        error: {
            code: 'PLN_SUBMISSION_LIMIT_EXCEEDED',
            message: 'Too many PLN applications submitted. Please wait before submitting another application.',
        },
        timestamp: new Date().toISOString(),
    },
    keyGenerator: (req) => {
        // Use IP + user agent for better tracking
        return `${req.ip || 'unknown'}-${req.get('User-Agent')}`;
    },
    skip: (req) => {
        // Skip rate limiting for authenticated admin users
        return req.headers.authorization?.startsWith('Bearer ') || false;
    },
});
// Rate limiting for tracking requests
exports.trackingRateLimit = (0, express_rate_limit_1.default)({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 20, // Limit each IP to 20 tracking requests per 5 minutes
    message: {
        success: false,
        error: {
            code: 'TRACKING_LIMIT_EXCEEDED',
            message: 'Too many tracking requests. Please wait before trying again.',
        },
        timestamp: new Date().toISOString(),
    },
});
// File upload rate limiting
exports.fileUploadRateLimit = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 file uploads per 15 minutes
    message: {
        success: false,
        error: {
            code: 'FILE_UPLOAD_LIMIT_EXCEEDED',
            message: 'Too many file uploads. Please wait before uploading again.',
        },
        timestamp: new Date().toISOString(),
    },
});
// Authentication rate limiting
exports.authRateLimit = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 login attempts per 15 minutes
    message: {
        success: false,
        error: {
            code: 'AUTH_LIMIT_EXCEEDED',
            message: 'Too many authentication attempts. Please wait before trying again.',
        },
        timestamp: new Date().toISOString(),
    },
    skipSuccessfulRequests: true, // Don't count successful requests
});
// Slow down middleware for suspicious activity
exports.suspiciousActivitySlowDown = (0, express_slow_down_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    delayAfter: 10, // Allow 10 requests per windowMs without delay
    delayMs: 500, // Add 500ms delay per request after delayAfter
    maxDelayMs: 20000, // Maximum delay of 20 seconds
});
// Advanced rate limiting with Redis (for production)
class AdvancedRateLimiter {
    constructor(redisClient) {
        this.redis = redisClient;
    }
    /**
     * Check if IP is in suspicious activity list
     */
    async isSuspiciousIP(ip) {
        if (!this.redis)
            return false;
        try {
            const suspiciousCount = await this.redis.get(`suspicious:${ip}`);
            return parseInt(suspiciousCount || '0') > 10;
        }
        catch (error) {
            console.error('Redis error checking suspicious IP:', error);
            return false;
        }
    }
    /**
     * Mark IP as suspicious
     */
    async markSuspiciousActivity(ip) {
        if (!this.redis)
            return;
        try {
            await this.redis.incr(`suspicious:${ip}`);
            await this.redis.expire(`suspicious:${ip}`, 3600); // Expire in 1 hour
        }
        catch (error) {
            console.error('Redis error marking suspicious activity:', error);
        }
    }
    /**
     * Custom rate limiter middleware
     */
    createCustomRateLimit(options) {
        return async (req, res, next) => {
            const key = options.keyGenerator ? options.keyGenerator(req) : (req.ip || 'unknown');
            if (options.skipIf && options.skipIf(req)) {
                return next();
            }
            // Check if IP is suspicious
            if (await this.isSuspiciousIP(req.ip || 'unknown')) {
                return res.status(429).json({
                    success: false,
                    error: {
                        code: 'SUSPICIOUS_ACTIVITY_BLOCKED',
                        message: 'Access temporarily blocked due to suspicious activity.',
                    },
                    timestamp: new Date().toISOString(),
                });
            }
            // Implement rate limiting logic here
            // This is a simplified version - use express-rate-limit with Redis store in production
            next();
        };
    }
}
exports.AdvancedRateLimiter = AdvancedRateLimiter;
// Export configured rate limiters
exports.rateLimiters = {
    general: exports.generalRateLimit,
    plnSubmission: exports.plnSubmissionRateLimit,
    tracking: exports.trackingRateLimit,
    fileUpload: exports.fileUploadRateLimit,
    auth: exports.authRateLimit,
    slowDown: exports.suspiciousActivitySlowDown,
};
//# sourceMappingURL=rateLimiting.js.map