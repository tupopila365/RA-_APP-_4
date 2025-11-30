"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = exports.AuthController = void 0;
const auth_service_1 = require("./auth.service");
class AuthController {
    /**
     * POST /api/auth/login
     * Login with email and password
     */
    async login(req, res, next) {
        try {
            const { email, password } = req.body;
            // Validate input
            if (!email || !password) {
                res.status(400).json({
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'Email and password are required',
                    },
                    timestamp: new Date().toISOString(),
                });
                return;
            }
            // Authenticate user
            const { user, tokens } = await auth_service_1.authService.login({ email, password });
            // Return user data without password
            const userData = {
                id: user._id,
                email: user.email,
                role: user.role,
                permissions: user.permissions,
            };
            res.status(200).json({
                success: true,
                data: {
                    user: userData,
                    accessToken: tokens.accessToken,
                    refreshToken: tokens.refreshToken,
                },
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            if (error.statusCode) {
                res.status(error.statusCode).json({
                    success: false,
                    error: {
                        code: error.code,
                        message: error.message,
                    },
                    timestamp: new Date().toISOString(),
                });
                return;
            }
            next(error);
        }
    }
    /**
     * POST /api/auth/refresh
     * Refresh access token using refresh token
     */
    async refresh(req, res, next) {
        try {
            const { refreshToken } = req.body;
            if (!refreshToken) {
                res.status(400).json({
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'Refresh token is required',
                    },
                    timestamp: new Date().toISOString(),
                });
                return;
            }
            // Generate new access token
            const { accessToken } = await auth_service_1.authService.refreshAccessToken(refreshToken);
            res.status(200).json({
                success: true,
                data: {
                    accessToken,
                },
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            if (error.statusCode) {
                res.status(error.statusCode).json({
                    success: false,
                    error: {
                        code: error.code,
                        message: error.message,
                    },
                    timestamp: new Date().toISOString(),
                });
                return;
            }
            next(error);
        }
    }
    /**
     * POST /api/auth/logout
     * Logout user by invalidating refresh token
     */
    async logout(req, res, next) {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    error: {
                        code: 'AUTH_UNAUTHORIZED',
                        message: 'Authentication required',
                    },
                    timestamp: new Date().toISOString(),
                });
                return;
            }
            // Remove refresh token from Redis
            await auth_service_1.authService.logout(req.user.userId);
            res.status(200).json({
                success: true,
                data: {
                    message: 'Logged out successfully',
                },
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            if (error.statusCode) {
                res.status(error.statusCode).json({
                    success: false,
                    error: {
                        code: error.code,
                        message: error.message,
                    },
                    timestamp: new Date().toISOString(),
                });
                return;
            }
            next(error);
        }
    }
}
exports.AuthController = AuthController;
exports.authController = new AuthController();
//# sourceMappingURL=auth.controller.js.map