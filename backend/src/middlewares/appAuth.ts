import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { ERROR_CODES } from '../constants/errors';

export interface AppAuthRequest extends Request {
  user?: {
    id: string;
    userId: string;
    email: string;
  };
}

export const authenticateAppUser = async (
  req: AppAuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: {
          code: ERROR_CODES.AUTH_MISSING_TOKEN,
          message: 'No token provided',
        },
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const token = authHeader.substring(7);

    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as {
        userId: string;
        email: string;
      };

      req.user = {
        id: decoded.userId,
        userId: decoded.userId,
        email: decoded.email,
      };
      next();
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        res.status(401).json({
          success: false,
          error: {
            code: ERROR_CODES.AUTH_TOKEN_EXPIRED,
            message: 'Token expired',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      res.status(401).json({
        success: false,
        error: {
          code: ERROR_CODES.AUTH_INVALID_TOKEN,
          message: 'Invalid token',
        },
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    next(error);
  }
};


