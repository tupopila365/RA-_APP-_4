"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = exports.requirePermission = void 0;
const errors_1 = require("../constants/errors");
const requirePermission = (permission) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: {
                    code: errors_1.ERROR_CODES.AUTH_UNAUTHORIZED,
                    message: 'Authentication required',
                },
                timestamp: new Date().toISOString(),
            });
            return;
        }
        // Super-admin has all permissions
        if (req.user.role === 'super-admin') {
            next();
            return;
        }
        // Check if user has the required permission
        if (!req.user.permissions.includes(permission)) {
            res.status(403).json({
                success: false,
                error: {
                    code: errors_1.ERROR_CODES.AUTH_INSUFFICIENT_PERMISSIONS,
                    message: 'Insufficient permissions',
                    details: { required: permission },
                },
                timestamp: new Date().toISOString(),
            });
            return;
        }
        next();
    };
};
exports.requirePermission = requirePermission;
const requireRole = (role) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: {
                    code: errors_1.ERROR_CODES.AUTH_UNAUTHORIZED,
                    message: 'Authentication required',
                },
                timestamp: new Date().toISOString(),
            });
            return;
        }
        if (req.user.role !== role) {
            res.status(403).json({
                success: false,
                error: {
                    code: errors_1.ERROR_CODES.AUTH_INSUFFICIENT_PERMISSIONS,
                    message: 'Insufficient permissions',
                    details: { required: role },
                },
                timestamp: new Date().toISOString(),
            });
            return;
        }
        next();
    };
};
exports.requireRole = requireRole;
//# sourceMappingURL=roleGuard.js.map