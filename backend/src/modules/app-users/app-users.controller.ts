import { Request, Response, NextFunction } from 'express';
import { AppAuthRequest } from '../../middlewares/appAuth';
import { appUsersService } from './app-users.service';
import { logger } from '../../utils/logger';
import { ERROR_CODES } from '../../constants/errors';

export class AppUsersController {
  /**
   * Register a new app user
   * POST /api/app-users/register
   * verificationMethod: 'email' | 'phone' - user must verify before login
   */
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password, fullName, phoneNumber, verificationMethod } = req.body;

      // Validate required fields
      if (!email || !email.trim()) {
        res.status(400).json({
          success: false,
          error: {
            code: ERROR_CODES.VALIDATION_ERROR,
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
            code: ERROR_CODES.VALIDATION_ERROR,
            message: 'Password is required and must be at least 8 characters',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const result = await appUsersService.register({
        email: email.trim(),
        password,
        fullName: fullName?.trim(),
        phoneNumber: phoneNumber?.trim(),
        verificationMethod: verificationMethod || 'email',
      });

      const { user, tokens, needEmailVerification, needPhoneVerification, phoneMasked } = result;

      if (needPhoneVerification) {
        res.status(200).json({
          success: true,
          data: {
            needPhoneVerification: true,
            phoneMasked,
            email: user.email,
            phone: user.phoneNumber,
            message: 'Verification code sent to your phone. Enter it to complete registration.',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      if (needEmailVerification) {
        res.status(201).json({
          success: true,
          data: {
            user: {
              id: user.id,
              email: user.email,
              fullName: user.fullName,
              phoneNumber: user.phoneNumber,
              isEmailVerified: user.isEmailVerified,
              isPhoneVerified: user.isPhoneVerified,
              createdAt: user.createdAt,
            },
            needEmailVerification: true,
            message: 'Please check your email to verify your account.',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      if (tokens) {
        res.status(201).json({
          success: true,
          data: {
            user: {
              id: user.id,
              email: user.email,
              fullName: user.fullName,
              phoneNumber: user.phoneNumber,
              isEmailVerified: user.isEmailVerified,
              isPhoneVerified: user.isPhoneVerified,
              createdAt: user.createdAt,
            },
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
          },
          message: 'User registered successfully.',
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error: any) {
      logger.error('Register error:', error);
      next(error);
    }
  }

  /**
   * Complete registration after phone OTP verification
   * POST /api/app-users/register/verify-otp
   */
  async registerVerifyOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, phone, otp, password } = req.body;

      if (!email || !phone || !otp || !password) {
        res.status(400).json({
          success: false,
          error: {
            code: ERROR_CODES.VALIDATION_ERROR,
            message: 'Email, phone, verification code, and password are required',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      if (password.length < 8) {
        res.status(400).json({
          success: false,
          error: {
            code: ERROR_CODES.VALIDATION_ERROR,
            message: 'Password must be at least 8 characters',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const { user, tokens } = await appUsersService.registerWithPhoneVerification(
        email.trim(),
        phone.trim(),
        otp.toString().trim(),
        password
      );

      res.status(201).json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            phoneNumber: user.phoneNumber,
            isEmailVerified: user.isEmailVerified,
            isPhoneVerified: user.isPhoneVerified,
            createdAt: user.createdAt,
          },
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        },
        message: 'Account created successfully.',
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Register verify OTP error:', error);
      next(error);
    }
  }

  /**
   * Login app user
   * POST /api/app-users/login
   */
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
        res.status(400).json({
          success: false,
          error: {
            code: ERROR_CODES.VALIDATION_ERROR,
            message: 'Email and password are required',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Authenticate user
      const { user, tokens } = await appUsersService.login({ email, password });

      logger.info(`App user logged in: ${user.email}`);

      res.status(200).json({
        success: true,
        data: {
          user: {
            id: user.id,
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
    } catch (error: any) {
      logger.error('Login error:', error);
      next(error);
    }
  }

  /**
   * Refresh access token
   * POST /api/app-users/refresh
   */
  async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(400).json({
          success: false,
          error: {
            code: ERROR_CODES.VALIDATION_ERROR,
            message: 'Refresh token is required',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const { accessToken } = await appUsersService.refreshAccessToken(refreshToken);

      res.status(200).json({
        success: true,
        data: {
          accessToken,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Refresh token error:', error);
      next(error);
    }
  }

  /**
   * Logout app user
   * POST /api/app-users/logout
   */
  async logout(req: AppAuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (userId) {
        await appUsersService.logout(userId);
      }

      res.status(200).json({
        success: true,
        data: {
          message: 'Logged out successfully',
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Logout error:', error);
      next(error);
    }
  }

  /**
   * Get current user profile
   * GET /api/app-users/me
   */
  async getMe(req: AppAuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: {
            code: ERROR_CODES.AUTH_REQUIRED,
            message: 'Authentication required',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const user = await appUsersService.getUserById(userId);

      res.status(200).json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            phoneNumber: user.phoneNumber,
            isEmailVerified: user.isEmailVerified,
            isPhoneVerified: user.isPhoneVerified,
            lastLoginAt: user.lastLoginAt,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          },
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Get me error:', error);
      next(error);
    }
  }

  /**
   * Update user profile
   * PUT /api/app-users/me
   */
  async updateMe(req: AppAuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: {
            code: ERROR_CODES.AUTH_REQUIRED,
            message: 'Authentication required',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const { fullName, phoneNumber } = req.body;

      const user = await appUsersService.updateUser(userId, {
        fullName,
        phoneNumber,
      });

      logger.info(`App user profile updated: ${userId}`);

      res.status(200).json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            phoneNumber: user.phoneNumber,
            updatedAt: user.updatedAt,
          },
        },
        message: 'Profile updated successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Update me error:', error);
      next(error);
    }
  }

  /**
   * Send OTP for change password (verify current password, then send OTP to registered phone)
   * POST /api/app-users/me/password/send-otp
   */
  async sendChangePasswordOtp(req: AppAuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: {
            code: ERROR_CODES.AUTH_REQUIRED,
            message: 'Authentication required',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const { currentPassword } = req.body;

      if (!currentPassword || !currentPassword.trim()) {
        res.status(400).json({
          success: false,
          error: {
            code: ERROR_CODES.VALIDATION_ERROR,
            message: 'Current password is required',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const { phoneMasked } = await appUsersService.requestChangePasswordOtp(userId, currentPassword.trim());

      res.status(200).json({
        success: true,
        data: {
          phoneMasked,
          message: 'Verification code sent to your registered phone.',
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Send change password OTP error:', error);
      next(error);
    }
  }

  /**
   * Change password with OTP (after send-otp)
   * PUT /api/app-users/me/password
   */
  async changePassword(req: AppAuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: {
            code: ERROR_CODES.AUTH_REQUIRED,
            message: 'Authentication required',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const { otp, newPassword } = req.body;

      if (!otp || !otp.toString().trim()) {
        res.status(400).json({
          success: false,
          error: {
            code: ERROR_CODES.VALIDATION_ERROR,
            message: 'Verification code is required',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      if (!newPassword || newPassword.length < 8) {
        res.status(400).json({
          success: false,
          error: {
            code: ERROR_CODES.VALIDATION_ERROR,
            message: 'New password must be at least 8 characters',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      await appUsersService.changePasswordWithOtp(userId, otp.toString().trim(), newPassword);

      logger.info(`App user password changed: ${userId}`);

      res.status(200).json({
        success: true,
        data: {
          message: 'Password changed successfully',
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Change password error:', error);
      next(error);
    }
  }

  /**
   * Verify email with token
   * POST /api/app-users/verify-email
   */
  async verifyEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token } = req.body;

      if (!token) {
        res.status(400).json({
          success: false,
          error: {
            code: ERROR_CODES.VALIDATION_ERROR,
            message: 'Verification token is required',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const { user, tokens } = await appUsersService.verifyEmail(token);

      logger.info(`Email verified for user: ${user.email}`);

      res.status(200).json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            phoneNumber: user.phoneNumber,
            isEmailVerified: user.isEmailVerified,
            emailVerifiedAt: user.emailVerifiedAt,
          },
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        },
        message: 'Email verified successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Verify email error:', error);
      next(error);
    }
  }

  /**
   * Resend verification email
   * POST /api/app-users/resend-verification
   */
  async resendVerificationEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body;

      if (!email || !email.trim()) {
        res.status(400).json({
          success: false,
          error: {
            code: ERROR_CODES.VALIDATION_ERROR,
            message: 'Email is required',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      await appUsersService.resendVerificationEmail(email.trim());

      res.status(200).json({
        success: true,
        data: {
          message: 'Verification email sent successfully',
        },
        message: 'Verification email has been sent. Please check your inbox.',
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Resend verification email error:', error);
      next(error);
    }
  }

  /**
   * Request password reset - send OTP to registered phone
   * POST /api/app-users/forgot-password
   */
  async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body;

      if (!email || !email.trim()) {
        res.status(400).json({
          success: false,
          error: {
            code: ERROR_CODES.VALIDATION_ERROR,
            message: 'Email is required',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const { phoneMasked, phone } = await appUsersService.requestPasswordReset(email.trim());

      res.status(200).json({
        success: true,
        data: {
          phoneMasked,
          phone, // For client to pass to verify-otp (null if user not found)
          message: 'If an account exists with this email, a verification code has been sent to your registered phone.',
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Forgot password error:', error);
      next(error);
    }
  }

  /**
   * Verify OTP and get reset token
   * POST /api/app-users/verify-otp
   */
  async verifyOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { phone, otp } = req.body;

      if (!phone || !phone.trim()) {
        res.status(400).json({
          success: false,
          error: {
            code: ERROR_CODES.VALIDATION_ERROR,
            message: 'Phone number is required',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      if (!otp || !otp.toString().trim()) {
        res.status(400).json({
          success: false,
          error: {
            code: ERROR_CODES.VALIDATION_ERROR,
            message: 'Verification code is required',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const { resetToken } = await appUsersService.verifyOtpAndGetResetToken(
        phone.trim(),
        otp.toString().trim()
      );

      res.status(200).json({
        success: true,
        data: {
          resetToken,
          message: 'Verification successful. You can now set your new password.',
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Verify OTP error:', error);
      next(error);
    }
  }

  /**
   * Reset password with token
   * POST /api/app-users/reset-password
   */
  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { resetToken, newPassword } = req.body;

      if (!resetToken || !resetToken.trim()) {
        res.status(400).json({
          success: false,
          error: {
            code: ERROR_CODES.VALIDATION_ERROR,
            message: 'Reset token is required',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      if (!newPassword || newPassword.length < 8) {
        res.status(400).json({
          success: false,
          error: {
            code: ERROR_CODES.VALIDATION_ERROR,
            message: 'New password must be at least 8 characters',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      await appUsersService.resetPasswordWithToken(resetToken.trim(), newPassword);

      res.status(200).json({
        success: true,
        data: {
          message: 'Password reset successfully. You can now log in with your new password.',
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Reset password error:', error);
      next(error);
    }
  }
}

export const appUsersController = new AppUsersController();

