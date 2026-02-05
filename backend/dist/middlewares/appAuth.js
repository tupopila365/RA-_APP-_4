"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuthenticateAppUser = exports.authenticateAppUser = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const errors_1 = require("../constants/errors");
const authenticateAppUser = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({
                success: false,
                error: {
                    code: errors_1.ERROR_CODES.AUTH_MISSING_TOKEN,
                    message: 'No token provided',
                },
                timestamp: new Date().toISOString(),
            });
            return;
        }
        const token = authHeader.substring(7);
        try {
            const decoded = jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET);
            req.user = {
                id: decoded.userId,
                userId: decoded.userId,
                email: decoded.email,
            };
            next();
        }
        catch (error) {
            if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
                res.status(401).json({
                    success: false,
                    error: {
                        code: errors_1.ERROR_CODES.AUTH_TOKEN_EXPIRED,
                        message: 'Token expired',
                    },
                    timestamp: new Date().toISOString(),
                });
                return;
            }
            res.status(401).json({
                success: false,
                error: {
                    code: errors_1.ERROR_CODES.AUTH_INVALID_TOKEN,
                    message: 'Invalid token',
                },
                timestamp: new Date().toISOString(),
            });
        }
    }
    catch (error) {
        next(error);
    }
};
exports.authenticateAppUser = authenticateAppUser;
/**
 * Optional authentication middleware - doesn't fail if no token, but sets user if token is valid
 */
const optionalAuthenticateAppUser = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            // No token provided - continue without user (for public endpoints)
            next();
            return;
        }
        const token = authHeader.substring(7);
        try {
            const decoded = jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET);
            req.user = {
                id: decoded.userId,
                userId: decoded.userId,
                email: decoded.email,
            };
            next();
        }
        catch (error) {
            // Invalid or expired token - continue without user (for public endpoints)
            // Don't fail the request, just proceed without authentication
            next();
        }
    }
    catch (error) {
        // Any other error - continue without user
        next();
    }
};
exports.optionalAuthenticateAppUser = optionalAuthenticateAppUser;
//# sourceMappingURL=appAuth.js.map