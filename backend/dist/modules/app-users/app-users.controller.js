"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appUsersController = exports.AppUsersController = void 0;
const app_users_service_1 = require("./app-users.service");
const logger_1 = require("../../utils/logger");
const errors_1 = require("../../constants/errors");
class AppUsersController {
    /**
     * Register a new app user
     * POST /api/app-users/register
     */
    async register(req, res, next) {
        try {
            const { email, password, fullName, phoneNumber } = req.body;
            // Validate required fields
            if (!email || !email.trim()) {
                res.status(400).json({
                    success: false,
                    error: {
                        code: errors_1.ERROR_CODES.VALIDATION_ERROR,
                        message: 'Email is required',
                    },
                    timestamp: new Date().toISOString(),
                });
                return;
            }
            if (!password || password.length < 8) {
                res.status(400).json({
                    success: false,
                    error: {
                        code: errors_1.ERROR_CODES.VALIDATION_ERROR,
                        message: 'Password is required and must be at least 8 characters',
                    },
                    timestamp: new Date().toISOString(),
                });
                return;
            }
            // Register user
            const { user, tokens } = await app_users_service_1.appUsersService.register({
                email: email.trim(),
                password,
                fullName: fullName?.trim(),
                phoneNumber: phoneNumber?.trim(),
            });
            logger_1.logger.info(`App user registered: ${user.email}`);
            res.status(201).json({
                success: true,
                data: {
                    user: {
                        id: user._id,
                        email: user.email,
                        fullName: user.fullName,
                        phoneNumber: user.phoneNumber,
                        isEmailVerified: user.isEmailVerified,
                        createdAt: user.createdAt,
                    },
                    accessToken: tokens.accessToken,
                    refreshToken: tokens.refreshToken,
                    emailVerificationRequired: !user.isEmailVerified,
                },
                message: 'User registered successfully. Please verify your email address.',
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            logger_1.logger.error('Register error:', error);
            next(error);
        }
    }
    /**
     * Login app user
     * POST /api/app-users/login
     */
    async login(req, res, next) {
        try {
            const { email, password } = req.body;
            // Validate input
            if (!email || !password) {
                res.status(400).json({
                    success: false,
                    error: {
                        code: errors_1.ERROR_CODES.VALIDATION_ERROR,
                        message: 'Email and password are required',
                    },
                    timestamp: new Date().toISOString(),
                });
                return;
            }
            // Authenticate user
            const { user, tokens } = await app_users_service_1.appUsersService.login({ email, password });
            logger_1.logger.info(`App user logged in: ${user.email}`);
            res.status(200).json({
                success: true,
                data: {
                    user: {
                        id: user._id,
                        email: user.email,
                        fullName: user.fullName,
                        phoneNumber: user.phoneNumber,
                        lastLoginAt: user.lastLoginAt,
                        createdAt: user.createdAt,
                    },
                    accessToken: tokens.accessToken,
                    refreshToken: tokens.refreshToken,
                },
                message: 'Login successful',
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            logger_1.logger.error('Login error:', error);
            next(error);
        }
    }
    /**
     * Refresh access token
     * POST /api/app-users/refresh
     */
    async refresh(req, res, next) {
        try {
            const { refreshToken } = req.body;
            if (!refreshToken) {
                res.status(400).json({
                    success: false,
                    error: {
                        code: errors_1.ERROR_CODES.VALIDATION_ERROR,
                        message: 'Refresh token is required',
                    },
                    timestamp: new Date().toISOString(),
                });
                return;
            }
            const { accessToken } = await app_users_service_1.appUsersService.refreshAccessToken(refreshToken);
            res.status(200).json({
                success: true,
                data: {
                    accessToken,
                },
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            logger_1.logger.error('Refresh token error:', error);
            next(error);
        }
    }
    /**
     * Logout app user
     * POST /api/app-users/logout
     */
    async logout(req, res, next) {
        try {
            const userId = req.user?.id;
            if (userId) {
                await app_users_service_1.appUsersService.logout(userId);
            }
            res.status(200).json({
                success: true,
                data: {
                    message: 'Logged out successfully',
                },
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            logger_1.logger.error('Logout error:', error);
            next(error);
        }
    }
    /**
     * Get current user profile
     * GET /api/app-users/me
     */
    async getMe(req, res, next) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    error: {
                        code: errors_1.ERROR_CODES.AUTH_REQUIRED,
                        message: 'Authentication required',
                    },
                    timestamp: new Date().toISOString(),
                });
                return;
            }
            const user = await app_users_service_1.appUsersService.getUserById(userId);
            res.status(200).json({
                success: true,
                data: {
                    user: {
                        id: user._id,
                        email: user.email,
                        fullName: user.fullName,
                        phoneNumber: user.phoneNumber,
                        isEmailVerified: user.isEmailVerified,
                        lastLoginAt: user.lastLoginAt,
                        createdAt: user.createdAt,
                        updatedAt: user.updatedAt,
                    },
                },
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            logger_1.logger.error('Get me error:', error);
            next(error);
        }
    }
    /**
     * Update user profile
     * PUT /api/app-users/me
     */
    async updateMe(req, res, next) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    error: {
                        code: errors_1.ERROR_CODES.AUTH_REQUIRED,
                        message: 'Authentication required',
                    },
                    timestamp: new Date().toISOString(),
                });
                return;
            }
            const { fullName, phoneNumber } = req.body;
            const user = await app_users_service_1.appUsersService.updateUser(userId, {
                fullName,
                phoneNumber,
            });
            logger_1.logger.info(`App user profile updated: ${userId}`);
            res.status(200).json({
                success: true,
                data: {
                    user: {
                        id: user._id,
                        email: user.email,
                        fullName: user.fullName,
                        phoneNumber: user.phoneNumber,
                        updatedAt: user.updatedAt,
                    },
                },
                message: 'Profile updated successfully',
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            logger_1.logger.error('Update me error:', error);
            next(error);
        }
    }
    /**
     * Change password
     * PUT /api/app-users/me/password
     */
    async changePassword(req, res, next) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    error: {
                        code: errors_1.ERROR_CODES.AUTH_REQUIRED,
                        message: 'Authentication required',
                    },
                    timestamp: new Date().toISOString(),
                });
                return;
            }
            const { oldPassword, newPassword } = req.body;
            if (!oldPassword || !newPassword) {
                res.status(400).json({
                    success: false,
                    error: {
                        code: errors_1.ERROR_CODES.VALIDATION_ERROR,
                        message: 'Old password and new password are required',
                    },
                    timestamp: new Date().toISOString(),
                });
                return;
            }
            if (newPassword.length < 8) {
                res.status(400).json({
                    success: false,
                    error: {
                        code: errors_1.ERROR_CODES.VALIDATION_ERROR,
                        message: 'New password must be at least 8 characters',
                    },
                    timestamp: new Date().toISOString(),
                });
                return;
            }
            await app_users_service_1.appUsersService.changePassword(userId, { oldPassword, newPassword });
            logger_1.logger.info(`App user password changed: ${userId}`);
            res.status(200).json({
                success: true,
                data: {
                    message: 'Password changed successfully',
                },
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            logger_1.logger.error('Change password error:', error);
            next(error);
        }
    }
    /**
     * Verify email with token
     * POST /api/app-users/verify-email
     */
    async verifyEmail(req, res, next) {
        try {
            const { token } = req.body;
            if (!token) {
                res.status(400).json({
                    success: false,
                    error: {
                        code: errors_1.ERROR_CODES.VALIDATION_ERROR,
                        message: 'Verification token is required',
                    },
                    timestamp: new Date().toISOString(),
                });
                return;
            }
            const user = await app_users_service_1.appUsersService.verifyEmail(token);
            logger_1.logger.info(`Email verified for user: ${user.email}`);
            res.status(200).json({
                success: true,
                data: {
                    user: {
                        id: user._id,
                        email: user.email,
                        fullName: user.fullName,
                        phoneNumber: user.phoneNumber,
                        isEmailVerified: user.isEmailVerified,
                        emailVerifiedAt: user.emailVerifiedAt,
                    },
                },
                message: 'Email verified successfully',
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            logger_1.logger.error('Verify email error:', error);
            next(error);
        }
    }
    /**
     * Resend verification email
     * POST /api/app-users/resend-verification
     */
    async resendVerificationEmail(req, res, next) {
        try {
            const { email } = req.body;
            if (!email || !email.trim()) {
                res.status(400).json({
                    success: false,
                    error: {
                        code: errors_1.ERROR_CODES.VALIDATION_ERROR,
                        message: 'Email is required',
                    },
                    timestamp: new Date().toISOString(),
                });
                return;
            }
            await app_users_service_1.appUsersService.resendVerificationEmail(email.trim());
            res.status(200).json({
                success: true,
                data: {
                    message: 'Verification email sent successfully',
                },
                message: 'Verification email has been sent. Please check your inbox.',
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            logger_1.logger.error('Resend verification email error:', error);
            next(error);
        }
    }
}
exports.AppUsersController = AppUsersController;
exports.appUsersController = new AppUsersController();
//# sourceMappingURL=app-users.controller.js.map