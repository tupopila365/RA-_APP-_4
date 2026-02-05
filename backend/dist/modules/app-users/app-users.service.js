"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.appUsersService = exports.AppUsersService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const db_1 = require("../../config/db");
const app_users_entity_1 = require("./app-users.entity");
const logger_1 = require("../../utils/logger");
const errors_1 = require("../../constants/errors");
const env_1 = require("../../config/env");
const redis_1 = require("../../config/redis");
const email_service_1 = require("../../services/email.service");
const redis_2 = require("../../utils/redis");
class AppUsersService {
    /**
     * Register a new app user
     */
    async register(dto) {
        try {
            const { email, password, fullName, phoneNumber } = dto;
            const repo = db_1.AppDataSource.getRepository(app_users_entity_1.AppUser);
            const existingUser = await repo.findOne({ where: { email: email.toLowerCase().trim() } });
            if (existingUser) {
                throw {
                    code: errors_1.ERROR_CODES.VALIDATION_ERROR,
                    message: 'User with this email already exists',
                    statusCode: 409,
                };
            }
            const user = repo.create({
                email: email.toLowerCase().trim(),
                password,
                fullName: fullName?.trim() ?? null,
                phoneNumber: phoneNumber?.trim() ?? null,
                isEmailVerified: true,
                emailVerifiedAt: new Date(),
            });
            const saved = await repo.save(user);
            const tokens = await this.generateTokens(saved);
            await this.storeRefreshToken(saved.id.toString(), tokens.refreshToken);
            logger_1.logger.info(`New app user registered: ${saved.email}`);
            const { password: _, emailVerificationToken: __, ...rest } = saved;
            return { user: rest, tokens };
        }
        catch (error) {
            logger_1.logger.error('Register app user error:', error);
            if (error.statusCode) {
                throw error;
            }
            throw {
                statusCode: 500,
                code: errors_1.ERROR_CODES.DB_OPERATION_FAILED,
                message: 'Failed to register user',
                details: error.message,
            };
        }
    }
    /**
     * Login app user
     */
    async login(credentials) {
        try {
            const { email, password } = credentials;
            const repo = db_1.AppDataSource.getRepository(app_users_entity_1.AppUser);
            const user = await repo.findOne({
                where: { email: email.toLowerCase().trim() },
                select: ['id', 'email', 'password', 'fullName', 'phoneNumber', 'isEmailVerified', 'lastLoginAt', 'createdAt', 'updatedAt'],
            });
            if (!user) {
                throw {
                    code: errors_1.ERROR_CODES.AUTH_INVALID_CREDENTIALS,
                    message: 'Invalid email or password',
                    statusCode: 401,
                };
            }
            const isPasswordValid = await user.comparePassword(password);
            if (!isPasswordValid) {
                throw {
                    code: errors_1.ERROR_CODES.AUTH_INVALID_CREDENTIALS,
                    message: 'Invalid email or password',
                    statusCode: 401,
                };
            }
            const tokens = await this.generateTokens(user);
            await this.storeRefreshToken(String(user.id), tokens.refreshToken);
            user.lastLoginAt = new Date();
            await repo.save(user);
            logger_1.logger.info(`App user logged in: ${user.email}`);
            const { password: _, ...rest } = user;
            return { user: rest, tokens };
        }
        catch (error) {
            logger_1.logger.error('Login app user error:', error);
            if (error.statusCode) {
                throw error;
            }
            throw {
                statusCode: 500,
                code: errors_1.ERROR_CODES.DB_OPERATION_FAILED,
                message: 'Failed to login',
                details: error.message,
            };
        }
    }
    /**
     * Get user by ID
     */
    async getUserById(id) {
        try {
            const idNum = parseInt(id, 10);
            if (isNaN(idNum)) {
                throw { statusCode: 404, code: errors_1.ERROR_CODES.NOT_FOUND, message: 'User not found' };
            }
            const repo = db_1.AppDataSource.getRepository(app_users_entity_1.AppUser);
            const user = await repo.findOne({
                where: { id: idNum },
                select: ['id', 'email', 'fullName', 'phoneNumber', 'isEmailVerified', 'emailVerifiedAt', 'lastLoginAt', 'createdAt', 'updatedAt'],
            });
            if (!user) {
                throw {
                    statusCode: 404,
                    code: errors_1.ERROR_CODES.NOT_FOUND,
                    message: 'User not found',
                };
            }
            return user;
        }
        catch (error) {
            logger_1.logger.error('Get user by ID error:', error);
            if (error.statusCode) {
                throw error;
            }
            throw {
                statusCode: 500,
                code: errors_1.ERROR_CODES.DB_OPERATION_FAILED,
                message: 'Failed to retrieve user',
                details: error.message,
            };
        }
    }
    /**
     * Update user profile
     */
    async updateUser(id, dto) {
        try {
            const idNum = parseInt(id, 10);
            const repo = db_1.AppDataSource.getRepository(app_users_entity_1.AppUser);
            const user = await repo.findOne({ where: { id: idNum } });
            if (!user) {
                throw {
                    statusCode: 404,
                    code: errors_1.ERROR_CODES.NOT_FOUND,
                    message: 'User not found',
                };
            }
            if (dto.fullName !== undefined)
                user.fullName = dto.fullName?.trim() ?? null;
            if (dto.phoneNumber !== undefined)
                user.phoneNumber = dto.phoneNumber?.trim() ?? null;
            await repo.save(user);
            logger_1.logger.info(`App user profile updated: ${id}`);
            const { password: _, ...rest } = user;
            return rest;
        }
        catch (error) {
            logger_1.logger.error('Update user error:', error);
            if (error.statusCode) {
                throw error;
            }
            throw {
                statusCode: 500,
                code: errors_1.ERROR_CODES.DB_OPERATION_FAILED,
                message: 'Failed to update user',
                details: error.message,
            };
        }
    }
    /**
     * Change user password
     */
    async changePassword(id, dto) {
        try {
            const { oldPassword, newPassword } = dto;
            // Get user with password
            const idNum = parseInt(id, 10);
            if (isNaN(idNum)) {
                throw { statusCode: 404, code: errors_1.ERROR_CODES.NOT_FOUND, message: 'User not found' };
            }
            const repo = db_1.AppDataSource.getRepository(app_users_entity_1.AppUser);
            const user = await repo.findOne({ where: { id: idNum } });
            if (!user) {
                throw {
                    statusCode: 404,
                    code: errors_1.ERROR_CODES.NOT_FOUND,
                    message: 'User not found',
                };
            }
            // Verify old password
            const isPasswordValid = await user.comparePassword(oldPassword);
            if (!isPasswordValid) {
                throw {
                    statusCode: 400,
                    code: errors_1.ERROR_CODES.AUTH_INVALID_CREDENTIALS,
                    message: 'Current password is incorrect',
                };
            }
            // Update password (will be hashed by pre-save hook)
            user.password = newPassword;
            await repo.save(user);
            logger_1.logger.info(`App user password changed: ${id}`);
        }
        catch (error) {
            logger_1.logger.error('Change password error:', error);
            if (error.statusCode) {
                throw error;
            }
            throw {
                statusCode: 500,
                code: errors_1.ERROR_CODES.DB_OPERATION_FAILED,
                message: 'Failed to change password',
                details: error.message,
            };
        }
    }
    /**
     * Generate access and refresh tokens
     */
    async generateTokens(user) {
        const payload = {
            userId: String(user.id),
            email: user.email,
        };
        const accessToken = jsonwebtoken_1.default.sign(payload, env_1.env.JWT_SECRET, {
            expiresIn: env_1.env.JWT_ACCESS_EXPIRY,
        });
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
            // If Redis is not configured, skip storing
            if (!redisClient) {
                logger_1.logger.warn('Redis not configured - refresh token not stored');
                return;
            }
            const key = `appuser:token:refresh:${userId}`;
            // Store token with 7 days expiry (604800 seconds)
            await redisClient.setEx(key, 604800, refreshToken);
            logger_1.logger.debug(`Refresh token stored for app user: ${userId}`);
        }
        catch (error) {
            logger_1.logger.error('Error storing refresh token in Redis:', error);
            // Don't throw error - allow login to continue without Redis
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
                const key = `appuser:token:refresh:${decoded.userId}`;
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
            const userId = parseInt(decoded.userId, 10);
            const repo = db_1.AppDataSource.getRepository(app_users_entity_1.AppUser);
            const user = await repo.findOne({ where: { id: userId } });
            if (!user) {
                throw {
                    code: errors_1.ERROR_CODES.AUTH_INVALID_TOKEN,
                    message: 'User not found',
                    statusCode: 401,
                };
            }
            const payload = {
                userId: String(user.id),
                email: user.email,
            };
            const accessToken = jsonwebtoken_1.default.sign(payload, env_1.env.JWT_SECRET, {
                expiresIn: env_1.env.JWT_ACCESS_EXPIRY,
            });
            return { accessToken };
        }
        catch (error) {
            logger_1.logger.error('Refresh token error:', error);
            if (error.statusCode) {
                throw error;
            }
            throw {
                statusCode: 401,
                code: errors_1.ERROR_CODES.AUTH_INVALID_TOKEN,
                message: 'Invalid or expired refresh token',
                details: error.message,
            };
        }
    }
    /**
     * Logout user (invalidate refresh token)
     */
    async logout(userId) {
        try {
            const redisClient = (0, redis_1.getRedisClient)();
            if (redisClient) {
                const key = `appuser:token:refresh:${userId}`;
                // Use timeout-protected Redis delete (2 second timeout)
                const deleted = await (0, redis_2.safeRedisDel)(redisClient, key, 2000);
                if (deleted) {
                    logger_1.logger.info(`App user logged out: ${userId}`);
                }
                else {
                    logger_1.logger.warn(`App user logout: Redis operation timed out or failed for user ${userId}, but logout continues`);
                }
            }
            else {
                logger_1.logger.warn('Redis not configured - cannot invalidate refresh token');
            }
            // Logout succeeds regardless of Redis status
        }
        catch (error) {
            logger_1.logger.error('Logout error:', error);
            // Don't throw error - logout should succeed even if Redis fails
        }
    }
    /**
     * Generate secure email verification token
     */
    generateEmailVerificationToken() {
        return crypto_1.default.randomBytes(32).toString('hex');
    }
    /**
     * Verify email using token
     */
    async verifyEmail(token) {
        try {
            const repo = db_1.AppDataSource.getRepository(app_users_entity_1.AppUser);
            const user = await repo.findOne({
                where: { emailVerificationToken: token },
            });
            if (!user) {
                throw {
                    statusCode: 400,
                    code: errors_1.ERROR_CODES.VALIDATION_ERROR,
                    message: 'Invalid verification token',
                };
            }
            if (user.emailVerificationTokenExpiry && user.emailVerificationTokenExpiry < new Date()) {
                throw {
                    statusCode: 400,
                    code: errors_1.ERROR_CODES.VALIDATION_ERROR,
                    message: 'Verification token has expired',
                };
            }
            if (user.isEmailVerified) {
                throw {
                    statusCode: 400,
                    code: errors_1.ERROR_CODES.VALIDATION_ERROR,
                    message: 'Email is already verified',
                };
            }
            user.isEmailVerified = true;
            user.emailVerifiedAt = new Date();
            user.emailVerificationToken = null;
            user.emailVerificationTokenExpiry = null;
            await repo.save(user);
            logger_1.logger.info(`Email verified for user: ${user.email}`);
            try {
                await email_service_1.emailService.sendWelcomeEmail(user.email, user.fullName ?? undefined);
            }
            catch (emailError) {
                logger_1.logger.error('Failed to send welcome email:', emailError);
            }
            const { password: _, emailVerificationToken: __, ...rest } = user;
            return rest;
        }
        catch (error) {
            logger_1.logger.error('Verify email error:', error);
            if (error.statusCode) {
                throw error;
            }
            throw {
                statusCode: 500,
                code: errors_1.ERROR_CODES.DB_OPERATION_FAILED,
                message: 'Failed to verify email',
                details: error.message,
            };
        }
    }
    /**
     * Resend verification email
     */
    async resendVerificationEmail(email) {
        try {
            const repo = db_1.AppDataSource.getRepository(app_users_entity_1.AppUser);
            const user = await repo.findOne({
                where: { email: email.toLowerCase().trim() },
                select: ['id', 'email', 'fullName', 'isEmailVerified', 'emailVerificationToken'],
            });
            if (!user) {
                throw {
                    statusCode: 404,
                    code: errors_1.ERROR_CODES.NOT_FOUND,
                    message: 'User not found',
                };
            }
            if (user.isEmailVerified) {
                throw {
                    statusCode: 400,
                    code: errors_1.ERROR_CODES.VALIDATION_ERROR,
                    message: 'Email is already verified',
                };
            }
            const verificationToken = this.generateEmailVerificationToken();
            const tokenExpiry = new Date();
            tokenExpiry.setHours(tokenExpiry.getHours() + 24);
            user.emailVerificationToken = verificationToken;
            user.emailVerificationTokenExpiry = tokenExpiry;
            await repo.save(user);
            await email_service_1.emailService.sendVerificationEmail(user.email, user.fullName ?? undefined, verificationToken);
            logger_1.logger.info(`Verification email resent to: ${user.email}`);
        }
        catch (error) {
            logger_1.logger.error('Resend verification email error:', error);
            if (error.statusCode) {
                throw error;
            }
            throw {
                statusCode: 500,
                code: errors_1.ERROR_CODES.DB_OPERATION_FAILED,
                message: 'Failed to resend verification email',
                details: error.message,
            };
        }
    }
}
exports.AppUsersService = AppUsersService;
exports.appUsersService = new AppUsersService();
//# sourceMappingURL=app-users.service.js.map