"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = exports.AuthService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("../../config/db");
const auth_entity_1 = require("./auth.entity");
const redis_1 = require("../../config/redis");
const env_1 = require("../../config/env");
const logger_1 = require("../../utils/logger");
const errors_1 = require("../../constants/errors");
const redis_2 = require("../../utils/redis");
class AuthService {
    /**
     * Authenticate user with email and password
     */
    async login(credentials) {
        // #region agent log
        const fs = require('fs');
        const logPath = 'c:\\Roads Authority Application\\.cursor\\debug.log';
        try {
            fs.appendFileSync(logPath, JSON.stringify({ location: 'auth.service.ts:29', message: 'AuthService.login called', data: { email: credentials.email, hasPassword: !!credentials.password }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'E' }) + '\n');
        }
        catch (e) { }
        // #endregion
        const { email, password } = credentials;
        // #region agent log
        try {
            fs.appendFileSync(logPath, JSON.stringify({ location: 'auth.service.ts:33', message: 'Looking up user in database', data: { email }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'E' }) + '\n');
        }
        catch (e) { }
        // #endregion
        // Find user with password field included
        const repo = db_1.AppDataSource.getRepository(auth_entity_1.User);
        const user = await repo.findOne({
            where: { email: email.toLowerCase().trim() },
            select: ['id', 'email', 'password', 'role', 'permissions', 'createdAt', 'updatedAt'],
        });
        // #region agent log
        try {
            fs.appendFileSync(logPath, JSON.stringify({ location: 'auth.service.ts:35', message: 'User lookup result', data: { userFound: !!user, userId: user?.id }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'E' }) + '\n');
        }
        catch (e) { }
        // #endregion
        if (!user) {
            // #region agent log
            try {
                fs.appendFileSync(logPath, JSON.stringify({ location: 'auth.service.ts:37', message: 'User not found', data: { email }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'E' }) + '\n');
            }
            catch (e) { }
            // #endregion
            throw {
                code: errors_1.ERROR_CODES.AUTH_INVALID_CREDENTIALS,
                message: 'Invalid email or password',
                statusCode: 401,
            };
        }
        // #region agent log
        try {
            fs.appendFileSync(logPath, JSON.stringify({ location: 'auth.service.ts:44', message: 'Verifying password', data: {}, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'E' }) + '\n');
        }
        catch (e) { }
        // #endregion
        // Verify password
        const isPasswordValid = await user.comparePassword(password);
        // #region agent log
        try {
            fs.appendFileSync(logPath, JSON.stringify({ location: 'auth.service.ts:46', message: 'Password verification result', data: { isPasswordValid }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'E' }) + '\n');
        }
        catch (e) { }
        // #endregion
        if (!isPasswordValid) {
            // #region agent log
            try {
                fs.appendFileSync(logPath, JSON.stringify({ location: 'auth.service.ts:48', message: 'Password invalid', data: {}, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'E' }) + '\n');
            }
            catch (e) { }
            // #endregion
            throw {
                code: errors_1.ERROR_CODES.AUTH_INVALID_CREDENTIALS,
                message: 'Invalid email or password',
                statusCode: 401,
            };
        }
        // #region agent log
        try {
            fs.appendFileSync(logPath, JSON.stringify({ location: 'auth.service.ts:55', message: 'Generating tokens', data: {}, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'E' }) + '\n');
        }
        catch (e) { }
        // #endregion
        // Generate tokens
        const tokens = await this.generateTokens(user);
        // #region agent log
        try {
            fs.appendFileSync(logPath, JSON.stringify({ location: 'auth.service.ts:58', message: 'Storing refresh token in Redis', data: { hasAccessToken: !!tokens.accessToken, hasRefreshToken: !!tokens.refreshToken }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'E' }) + '\n');
        }
        catch (e) { }
        // #endregion
        // Store refresh token in Redis
        await this.storeRefreshToken(String(user.id), tokens.refreshToken);
        logger_1.logger.info(`User logged in: ${user.email}`);
        // #region agent log
        try {
            fs.appendFileSync(logPath, JSON.stringify({ location: 'auth.service.ts:62', message: 'Login completed successfully', data: { email: user.email }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'E' }) + '\n');
        }
        catch (e) { }
        // #endregion
        return { user, tokens };
    }
    /**
     * Generate access and refresh tokens
     */
    async generateTokens(user) {
        const payload = {
            userId: String(user.id),
            email: user.email,
            role: user.role,
            permissions: user.permissions,
        };
        // Generate access token (15 minutes)
        const accessToken = jsonwebtoken_1.default.sign(payload, env_1.env.JWT_SECRET, {
            expiresIn: env_1.env.JWT_ACCESS_EXPIRY,
        });
        // Generate refresh token (7 days)
        const refreshToken = jsonwebtoken_1.default.sign({ userId: String(user.id) }, env_1.env.JWT_SECRET, {
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
            const repo = db_1.AppDataSource.getRepository(auth_entity_1.User);
            const userId = parseInt(decoded.userId, 10);
            const user = await repo.findOne({ where: { id: userId } });
            if (!user) {
                throw {
                    code: errors_1.ERROR_CODES.AUTH_INVALID_TOKEN,
                    message: 'User not found',
                    statusCode: 401,
                };
            }
            // Generate new access token
            const payload = {
                userId: String(user.id),
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
                // Use timeout-protected Redis delete (2 second timeout)
                const deleted = await (0, redis_2.safeRedisDel)(redisClient, key, 2000);
                if (deleted) {
                    logger_1.logger.info(`User logged out: ${userId}`);
                }
                else {
                    logger_1.logger.warn(`User logout: Redis operation timed out or failed for user ${userId}, but logout continues`);
                }
            }
            else {
                logger_1.logger.warn('Redis not configured - cannot invalidate refresh token');
            }
            // Logout succeeds regardless of Redis status - don't throw errors
        }
        catch (error) {
            logger_1.logger.error('Error during logout (non-fatal):', error);
            // Don't throw error - logout should succeed even if Redis fails
            // This ensures logout completes quickly even on slow networks
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