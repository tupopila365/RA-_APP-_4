import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
import { AuthRequest } from '../../middlewares/auth';

export class AuthController {
  /**
   * POST /api/auth/login
   * Login with email and password
   */
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
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
      const { user, tokens } = await authService.login({ email, password });

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
    } catch (error: any) {
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
  async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
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
      const { accessToken } = await authService.refreshAccessToken(refreshToken);

      res.status(200).json({
        success: true,
        data: {
          accessToken,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
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
  async logout(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
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
      await authService.logout(req.user.userId);

      res.status(200).json({
        success: true,
        data: {
          message: 'Logged out successfully',
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
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

export const authController = new AuthController();
