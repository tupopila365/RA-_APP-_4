import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
import { AuthRequest } from '../../middlewares/auth';

export class AuthController {
  /**
   * POST /api/auth/login
   * Login with email and password
   */
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    // #region agent log
    const fs = require('fs');
    const logPath = 'c:\\Roads Authority Application\\.cursor\\debug.log';
    try { fs.appendFileSync(logPath, JSON.stringify({location:'auth.controller.ts:10',message:'Login endpoint called',data:{email:req.body?.email,hasPassword:!!req.body?.password},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})+'\n'); } catch(e){}
    // #endregion
    try {
      const { email, password } = req.body;

      // #region agent log
      try { fs.appendFileSync(logPath, JSON.stringify({location:'auth.controller.ts:14',message:'Validating input',data:{hasEmail:!!email,hasPassword:!!password},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})+'\n'); } catch(e){}
      // #endregion

      // Validate input
      if (!email || !password) {
        // #region agent log
        try { fs.appendFileSync(logPath, JSON.stringify({location:'auth.controller.ts:16',message:'Validation failed',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})+'\n'); } catch(e){}
        // #endregion
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

      // #region agent log
      try { fs.appendFileSync(logPath, JSON.stringify({location:'auth.controller.ts:28',message:'Calling authService.login',data:{email},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})+'\n'); } catch(e){}
      // #endregion

      // Authenticate user
      const { user, tokens } = await authService.login({ email, password });

      // #region agent log
      try { fs.appendFileSync(logPath, JSON.stringify({location:'auth.controller.ts:30',message:'AuthService.login succeeded',data:{userId:user?._id?.toString(),hasTokens:!!(tokens?.accessToken&&tokens?.refreshToken)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})+'\n'); } catch(e){}
      // #endregion

      // Return user data without password
      const userData = {
        id: user._id,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
      };

      // #region agent log
      try { fs.appendFileSync(logPath, JSON.stringify({location:'auth.controller.ts:38',message:'Sending success response',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})+'\n'); } catch(e){}
      // #endregion

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
      // #region agent log
      try { fs.appendFileSync(logPath, JSON.stringify({location:'auth.controller.ts:47',message:'Login endpoint error',data:{statusCode:error?.statusCode,code:error?.code,message:error?.message,errorType:error?.constructor?.name},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})+'\n'); } catch(e){}
      // #endregion
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
