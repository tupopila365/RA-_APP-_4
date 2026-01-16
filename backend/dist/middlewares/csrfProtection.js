"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CSRFProtection = void 0;
const crypto_1 = __importDefault(require("crypto"));
const secureIdGenerator_1 = require("../utils/secureIdGenerator");
/**
 * CSRF Protection middleware
 */
class CSRFProtection {
    /**
     * Generate CSRF token for a session
     */
    static generateToken(req) {
        const token = secureIdGenerator_1.SecureIdGenerator.generateCSRFToken();
        const sessionId = this.getSessionId(req);
        this.tokenStore.set(sessionId, {
            token,
            expires: Date.now() + this.TOKEN_EXPIRY,
            ip: req.ip || 'unknown',
        });
        // Clean up expired tokens
        this.cleanupExpiredTokens();
        return token;
    }
    /**
     * Get session ID from request
     */
    static getSessionId(req) {
        // Use IP + User-Agent as session identifier for stateless approach
        const userAgent = req.get('User-Agent') || '';
        return crypto_1.default.createHash('sha256')
            .update(`${req.ip}-${userAgent}`)
            .digest('hex');
    }
    /**
     * Clean up expired tokens
     */
    static cleanupExpiredTokens() {
        const now = Date.now();
        for (const [sessionId, tokenData] of this.tokenStore.entries()) {
            if (tokenData.expires < now) {
                this.tokenStore.delete(sessionId);
            }
        }
    }
    /**
     * Validate CSRF token
     */
    static validateToken(req, providedToken) {
        const sessionId = this.getSessionId(req);
        const tokenData = this.tokenStore.get(sessionId);
        if (!tokenData) {
            return false;
        }
        // Check if token is expired
        if (tokenData.expires < Date.now()) {
            this.tokenStore.delete(sessionId);
            return false;
        }
        // Check if IP matches (additional security)
        if (tokenData.ip !== (req.ip || 'unknown')) {
            return false;
        }
        // Use timing-safe comparison
        return crypto_1.default.timingSafeEqual(Buffer.from(tokenData.token, 'base64url'), Buffer.from(providedToken, 'base64url'));
    }
}
exports.CSRFProtection = CSRFProtection;
CSRFProtection.CSRF_TOKEN_HEADER = 'x-csrf-token';
CSRFProtection.CSRF_COOKIE_NAME = 'csrf-token';
CSRFProtection.TOKEN_EXPIRY = 60 * 60 * 1000; // 1 hour
CSRFProtection.tokenStore = new Map();
/**
 * Middleware to provide CSRF token
 */
CSRFProtection.provideToken = (req, res, next) => {
    const token = CSRFProtection.generateToken(req);
    // Set token in cookie (httpOnly for security)
    res.cookie(CSRFProtection.CSRF_COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: CSRFProtection.TOKEN_EXPIRY,
    });
    // Also provide in response header for SPA consumption
    res.setHeader('X-CSRF-Token', token);
    next();
};
/**
 * Middleware to validate CSRF token
 */
CSRFProtection.validateCSRF = (req, res, next) => {
    // Skip CSRF validation for GET, HEAD, OPTIONS requests
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        return next();
    }
    // Skip for authenticated API requests with valid JWT
    if (req.headers.authorization?.startsWith('Bearer ')) {
        return next();
    }
    const token = req.headers[CSRFProtection.CSRF_TOKEN_HEADER] ||
        req.body._csrf ||
        req.query._csrf;
    if (!token) {
        res.status(403).json({
            success: false,
            error: {
                code: 'CSRF_TOKEN_MISSING',
                message: 'CSRF token is required',
            },
            timestamp: new Date().toISOString(),
        });
        return;
    }
    if (!CSRFProtection.validateToken(req, token)) {
        res.status(403).json({
            success: false,
            error: {
                code: 'CSRF_TOKEN_INVALID',
                message: 'Invalid or expired CSRF token',
            },
            timestamp: new Date().toISOString(),
        });
        return;
    }
    next();
};
/**
 * Middleware for PLN form submissions (combines token provision and validation)
 */
CSRFProtection.protectPLNSubmission = (req, res, next) => {
    if (req.method === 'GET') {
        // Provide token for form rendering
        return CSRFProtection.provideToken(req, res, next);
    }
    else {
        // Validate token for form submission
        return CSRFProtection.validateCSRF(req, res, next);
    }
};
/**
 * Get CSRF token for client-side usage
 */
CSRFProtection.getTokenForClient = (req, res) => {
    const token = CSRFProtection.generateToken(req);
    res.json({
        success: true,
        data: {
            csrfToken: token,
            expires: Date.now() + CSRFProtection.TOKEN_EXPIRY,
        },
        timestamp: new Date().toISOString(),
    });
};
//# sourceMappingURL=csrfProtection.js.map