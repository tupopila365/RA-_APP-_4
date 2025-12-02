"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = exports.AuthService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const auth_model_1 = require("./auth.model");
const redis_1 = require("../../config/redis");
const env_1 = require("../../config/env");
const logger_1 = require("../../utils/logger");
const errors_1 = require("../../constants/errors");
class AuthService {
    /**
     * Authenticate user with email and password
     */
    async login(credentials) {
        const { email, password } = credentials;
        // Find user with password field included
        const user = await auth_model_1.User.findOne({ email }).select('+password');
        if (!user) {
            throw {
                code: errors_1.ERROR_CODES.AUTH_INVALID_CREDENTIALS,
                message: 'Invalid email or password',
                statusCode: 401,
            };
        }
        // Verify password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            throw {
                code: errors_1.ERROR_CODES.AUTH_INVALID_CREDENTIALS,
                message: 'Invalid email or password',
                statusCode: 401,
            };
        }
        // Generate tokens
        const tokens = await this.generateTokens(user);
        // Store refresh token in Redis
        await this.storeRefreshToken(user._id.toString(), tokens.refreshToken);
        logger_1.logger.info(`User logged in: ${user.email}`);
        return { user, tokens };
    }
    /**
     * Generate access and refresh tokens
     */
    async generateTokens(user) {
        const payload = {
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
            permissions: user.permissions,
        };
        // Generate access token (15 minutes)
        const accessToken = jsonwebtoken_1.default.sign(payload, env_1.env.JWT_SECRET, {
            expiresIn: env_1.env.JWT_ACCESS_EXPIRY,
        });
        // Generate refresh token (7 days)
        const refreshToken = jsonwebtoken_1.default.sign({ userId: user._id.toString() }, env_1.env.JWT_SECRET, {
            expiresIn: env_1.env.JWT_REFRESH_EXPIRY,
        });
        return { accessToken, refreshToken };
    }
    /**
     * Store refresh token in Redis with expiry
     */
    async storeRefreshToken(userId, refreshToken) {
        try {
            const redisClient = (0, redis_1.getRedisClient)();
            // If Redis is not configured, skip storing (tokens will still work but won't be invalidated on logout)
            if (!redisClient) {
                logger_1.logger.warn('Redis not configured - refresh token not stored (logout will not invalidate tokens)');
                return;
            }
            const key = `token:refresh:${userId}`;
            // Store token with 7 days expiry (604800 seconds)
            await redisClient.setEx(key, 604800, refreshToken);
            logger_1.logger.debug(`Refresh token stored for user: ${userId}`);
        }
        catch (error) {
            logger_1.logger.error('Error storing refresh token in Redis:', error);
            // Don't throw error - allow login to continue without Redis
            logger_1.logger.warn('Continuing without Redis - refresh tokens will not be invalidated on logout');
        }
    }
    /**
     * Refresh access token using refresh token
     */
    async refreshAccessToken(refreshToken) {
        try {
            // Verify refresh token
            const decoded = jsonwebtoken_1.default.verify(refreshToken, env_1.env.JWT_SECRET);
            // Check if refresh token exists in Redis (if Redis is configured)
            const redisClient = (0, redis_1.getRedisClient)();
            if (redisClient) {
                const key = `token:refresh:${decoded.userId}`;
                const storedToken = await redisClient.get(key);
                if (!storedToken || storedToken !== refreshToken) {
                    throw {
                        code: errors_1.ERROR_CODES.AUTH_INVALID_TOKEN,
                        message: 'Invalid or expired refresh token',
                        statusCode: 401,
                    };
                }
            }
            else {
                logger_1.logger.warn('Redis not configured - skipping refresh token validation');
            }
            // Get user details
            const user = await auth_model_1.User.findById(decoded.userId);
            if (!user) {
                throw {
                    code: errors_1.ERROR_CODES.AUTH_INVALID_TOKEN,
                    message: 'User not found',
                    statusCode: 401,
                };
            }
            // Generate new access token
            const payload = {
                userId: user._id.toString(),
                email: user.email,
                role: user.role,
                permissions: user.permissions,
            };
            const accessToken = jsonwebtoken_1.default.sign(payload, env_1.env.JWT_SECRET, {
                expiresIn: env_1.env.JWT_ACCESS_EXPIRY,
            });
            logger_1.logger.info(`Access token refreshed for user: ${user.email}`);
            return { accessToken };
        }
        catch (error) {
            if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
                throw {
                    code: errors_1.ERROR_CODES.AUTH_TOKEN_EXPIRED,
                    message: 'Refresh token expired',
                    statusCode: 401,
                };
            }
            if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
                throw {
                    code: errors_1.ERROR_CODES.AUTH_INVALID_TOKEN,
                    message: 'Invalid refresh token',
                    statusCode: 401,
                };
            }
            throw error;
        }
    }
    /**
     * Logout user by removing refresh token from Redis
     */
    async logout(userId) {
        try {
            const redisClient = (0, redis_1.getRedisClient)();
            const key = `token:refresh:${userId}`;
            if (redisClient) {
                await redisClient.del(key);
            }
            logger_1.logger.info(`User logged out: ${userId}`);
        }
        catch (error) {
            logger_1.logger.error('Error removing refresh token from Redis:', error);
            throw {
                code: errors_1.ERROR_CODES.SERVER_ERROR,
                message: 'Failed to logout',
                statusCode: 500,
            };
        }
    }
    /**
     * Verify if a refresh token is valid
     */
    async verifyRefreshToken(userId, refreshToken) {
        try {
            const redisClient = (0, redis_1.getRedisClient)();
            if (!redisClient) {
                return false;
            }
            const key = `token:refresh:${userId}`;
            const storedToken = await redisClient.get(key);
            return storedToken === refreshToken;
        }
        catch (error) {
            logger_1.logger.error('Error verifying refresh token:', error);
            return false;
        }
    }
}
exports.AuthService = AuthService;
exports.authService = new AuthService();
//# sourceMappingURL=auth.service.js.map