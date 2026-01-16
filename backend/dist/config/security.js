"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityConfig = void 0;
const cors_1 = __importDefault(require("cors"));
const securityHeaders_1 = require("../middlewares/securityHeaders");
const rateLimiting_1 = require("../middlewares/rateLimiting");
/**
 * Security configuration for the application
 */
class SecurityConfig {
    /**
     * Apply all security configurations
     */
    static configure(app) {
        // Apply security headers
        app.use(securityHeaders_1.SecurityHeaders.configureHelmet());
        app.use(securityHeaders_1.SecurityHeaders.applySecurityHeaders);
        app.use('/api', securityHeaders_1.SecurityHeaders.apiSecurityHeaders);
        app.use('/uploads', securityHeaders_1.SecurityHeaders.fileUploadHeaders);
        // Configure CORS
        app.use((0, cors_1.default)(securityHeaders_1.SecurityHeaders.configureCORS()));
        // Apply general rate limiting
        app.use('/api', rateLimiting_1.rateLimiters.general);
        app.use('/api/auth', rateLimiting_1.rateLimiters.auth);
        // Disable X-Powered-By header
        app.disable('x-powered-by');
        // Trust proxy (for rate limiting and IP detection)
        app.set('trust proxy', 1);
    }
    /**
     * Security environment validation
     */
    static validateEnvironment() {
        const requiredEnvVars = [
            'JWT_SECRET',
            'CLOUDINARY_CLOUD_NAME',
            'CLOUDINARY_API_KEY',
            'CLOUDINARY_API_SECRET',
        ];
        const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
        if (missingVars.length > 0) {
            throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
        }
        // Validate JWT secret strength
        if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
            throw new Error('JWT_SECRET must be at least 32 characters long');
        }
        // Warn about development mode
        if (process.env.NODE_ENV !== 'production') {
            console.warn('⚠️  Application is running in development mode');
        }
    }
    /**
     * Security monitoring setup
     */
    static setupMonitoring() {
        // Log security events
        process.on('uncaughtException', (error) => {
            console.error('Uncaught Exception:', error);
            // In production, you might want to send this to a monitoring service
        });
        process.on('unhandledRejection', (reason, promise) => {
            console.error('Unhandled Rejection at:', promise, 'reason:', reason);
            // In production, you might want to send this to a monitoring service
        });
    }
}
exports.SecurityConfig = SecurityConfig;
//# sourceMappingURL=security.js.map