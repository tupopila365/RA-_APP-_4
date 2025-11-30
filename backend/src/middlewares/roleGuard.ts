import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { ERROR_CODES } from '../constants/errors';

export const requirePermission = (permission: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          code: ERROR_CODES.AUTH_UNAUTHORIZED,
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
          code: ERROR_CODES.AUTH_INSUFFICIENT_PERMISSIONS,
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

export const requireRole = (role: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          code: ERROR_CODES.AUTH_UNAUTHORIZED,
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
          code: ERROR_CODES.AUTH_INSUFFICIENT_PERMISSIONS,
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
