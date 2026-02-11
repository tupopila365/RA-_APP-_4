import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { AppDataSource } from '../../config/db';
import { AppUser } from './app-users.entity';
import { RegisterDTO, LoginDTO, UpdateProfileDTO, ChangePasswordDTO } from './app-users.dto';
import { logger } from '../../utils/logger';
import { ERROR_CODES } from '../../constants/errors';
import { env } from '../../config/env';
import { getRedisClient } from '../../config/redis';
import { emailService } from '../../services/email.service';
import { smsService, normalizePhone } from '../../services/sms.service';
import { storeOtp, verifyAndConsumeOtp, storeRegisterOtp, verifyAndConsumeRegisterOtp, storeChangePasswordOtp, verifyAndConsumeChangePasswordOtp } from '../../services/otp.service';
import { safeRedisDel } from '../../utils/redis';

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface TokenPayload {
  userId: string;
  email: string;
}

export class AppUsersService {
  /**
   * Register a new app user
   * If verificationMethod is 'email': creates user unverified, sends verification email
   * If verificationMethod is 'phone': sends OTP (use registerWithPhoneVerification after)
   */
  async register(dto: RegisterDTO): Promise<{ user: AppUser; tokens?: AuthTokens; needEmailVerification?: boolean; needPhoneVerification?: boolean; phoneMasked?: string }> {
    try {
      const { email, password, fullName, phoneNumber, verificationMethod } = dto;
      const repo = AppDataSource.getRepository(AppUser);

      const existingUser = await repo.findOne({ where: { email: email.toLowerCase().trim() } });
      if (existingUser) {
        throw {
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'User with this email already exists',
          statusCode: 409,
        };
      }

      const verification = verificationMethod || 'email';

      if (verification === 'phone') {
        if (!phoneNumber || !phoneNumber.trim()) {
          throw {
            code: ERROR_CODES.VALIDATION_ERROR,
            message: 'Phone number is required for phone verification',
            statusCode: 400,
          };
        }
        if (!smsService.isConfigured()) {
          throw {
            code: ERROR_CODES.DB_OPERATION_FAILED,
            message: 'SMS service is not configured. Please use email verification.',
            statusCode: 503,
          };
        }

        const otp = crypto.randomInt(100000, 999999).toString();
        await storeRegisterOtp(phoneNumber, otp, email, fullName?.trim() ?? null, phoneNumber.trim());

        const message = `Your Roads Authority verification code is: ${otp}. Valid for 5 minutes.`;
        await smsService.sendSms(phoneNumber, message);

        const normalizedPhone = normalizePhone(phoneNumber);
        const phoneMasked = `***${normalizedPhone.slice(-3)}`;

        logger.info(`Registration OTP sent for: ${email}`);

        return {
          needPhoneVerification: true,
          phoneMasked,
          user: { email, fullName: fullName?.trim() ?? null, phoneNumber: phoneNumber.trim() } as AppUser,
        };
      }

      // Email verification flow
      const verificationToken = this.generateEmailVerificationToken();
      const tokenExpiry = new Date();
      tokenExpiry.setHours(tokenExpiry.getHours() + 24);

      const user = repo.create({
        email: email.toLowerCase().trim(),
        password,
        fullName: fullName?.trim() ?? null,
        phoneNumber: phoneNumber?.trim() ?? null,
        isEmailVerified: false,
        isPhoneVerified: false,
        emailVerificationToken: verificationToken,
        emailVerificationTokenExpiry: tokenExpiry,
      });

      const saved = await repo.save(user);

      await emailService.sendVerificationEmail(
        saved.email,
        saved.fullName ?? undefined,
        verificationToken
      );

      logger.info(`New app user registered (email pending): ${saved.email}`);

      const { password: _, emailVerificationToken: __, ...rest } = saved;
      return {
        needEmailVerification: true,
        user: rest as AppUser,
      };
    } catch (error: any) {
      logger.error('Register app user error:', error);
      if (error.statusCode) {
        throw error;
      }
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to register user',
        details: error.message,
      };
    }
  }

  /**
   * Complete registration after phone OTP verification
   */
  async registerWithPhoneVerification(
    email: string,
    phone: string,
    otp: string,
    password: string
  ): Promise<{ user: AppUser; tokens: AuthTokens }> {
    try {
      const payload = await verifyAndConsumeRegisterOtp(phone, otp);

      if (!payload || payload.email.toLowerCase() !== email.toLowerCase().trim()) {
        throw {
          statusCode: 400,
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Invalid or expired verification code. Please request a new one.',
        };
      }

      const repo = AppDataSource.getRepository(AppUser);
      const existingUser = await repo.findOne({ where: { email: payload.email.toLowerCase() } });
      if (existingUser) {
        throw {
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'User with this email already exists',
          statusCode: 409,
        };
      }

      const user = repo.create({
        email: payload.email.toLowerCase(),
        password,
        fullName: payload.fullName,
        phoneNumber: payload.phoneNumber,
        isEmailVerified: false,
        isPhoneVerified: true,
        phoneVerifiedAt: new Date(),
      });

      const saved = await repo.save(user);
      const tokens = await this.generateTokens(saved);
      await this.storeRefreshToken(saved.id.toString(), tokens.refreshToken);

      logger.info(`New app user registered (phone verified): ${saved.email}`);

      const { password: _, ...rest } = saved;
      return { user: rest as AppUser, tokens };
    } catch (error: any) {
      logger.error('Register with phone verification error:', error);
      if (error.statusCode) {
        throw error;
      }
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to complete registration',
        details: error.message,
      };
    }
  }

  /**
   * Login app user
   */
  async login(credentials: LoginDTO): Promise<{ user: AppUser; tokens: AuthTokens }> {
    try {
      const { email, password } = credentials;
      const repo = AppDataSource.getRepository(AppUser);
      const user = await repo.findOne({
        where: { email: email.toLowerCase().trim() },
        select: ['id', 'email', 'password', 'fullName', 'phoneNumber', 'isEmailVerified', 'isPhoneVerified', 'lastLoginAt', 'createdAt', 'updatedAt'],
      });

      if (!user) {
        throw {
          code: ERROR_CODES.AUTH_INVALID_CREDENTIALS,
          message: 'Invalid email or password',
          statusCode: 401,
        };
      }

      const isVerified = user.isEmailVerified || user.isPhoneVerified;
      if (!isVerified) {
        throw {
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Please verify your email or phone number before signing in.',
          statusCode: 403,
        };
      }

      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        throw {
          code: ERROR_CODES.AUTH_INVALID_CREDENTIALS,
          message: 'Invalid email or password',
          statusCode: 401,
        };
      }

      const tokens = await this.generateTokens(user);
      await this.storeRefreshToken(String(user.id), tokens.refreshToken);

      user.lastLoginAt = new Date();
      await repo.save(user);

      logger.info(`App user logged in: ${user.email}`);

      const { password: _, ...rest } = user;
      return { user: rest as AppUser, tokens };
    } catch (error: any) {
      logger.error('Login app user error:', error);
      if (error.statusCode) {
        throw error;
      }
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to login',
        details: error.message,
      };
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(id: string): Promise<AppUser> {
    try {
      const idNum = parseInt(id, 10);
      if (isNaN(idNum)) {
        throw { statusCode: 404, code: ERROR_CODES.NOT_FOUND, message: 'User not found' };
      }
      const repo = AppDataSource.getRepository(AppUser);
      const user = await repo.findOne({
        where: { id: idNum },
        select: ['id', 'email', 'fullName', 'phoneNumber', 'isEmailVerified', 'isPhoneVerified', 'emailVerifiedAt', 'phoneVerifiedAt', 'lastLoginAt', 'createdAt', 'updatedAt'],
      });

      if (!user) {
        throw {
          statusCode: 404,
          code: ERROR_CODES.NOT_FOUND,
          message: 'User not found',
        };
      }

      return user;
    } catch (error: any) {
      logger.error('Get user by ID error:', error);
      if (error.statusCode) {
        throw error;
      }
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to retrieve user',
        details: error.message,
      };
    }
  }

  /**
   * Update user profile
   */
  async updateUser(id: string, dto: UpdateProfileDTO): Promise<AppUser> {
    try {
      const idNum = parseInt(id, 10);
      const repo = AppDataSource.getRepository(AppUser);
      const user = await repo.findOne({ where: { id: idNum } });

      if (!user) {
        throw {
          statusCode: 404,
          code: ERROR_CODES.NOT_FOUND,
          message: 'User not found',
        };
      }

      if (dto.fullName !== undefined) user.fullName = dto.fullName?.trim() ?? null;
      if (dto.phoneNumber !== undefined) user.phoneNumber = dto.phoneNumber?.trim() ?? null;
      await repo.save(user);

      logger.info(`App user profile updated: ${id}`);
      const { password: _, ...rest } = user;
      return rest as AppUser;
    } catch (error: any) {
      logger.error('Update user error:', error);
      if (error.statusCode) {
        throw error;
      }
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to update user',
        details: error.message,
      };
    }
  }

  /**
   * Change user password
   */
  async changePassword(id: string, dto: ChangePasswordDTO): Promise<void> {
    try {
      const { oldPassword, newPassword } = dto;

      // Get user with password
      const idNum = parseInt(id, 10);
      if (isNaN(idNum)) {
        throw { statusCode: 404, code: ERROR_CODES.NOT_FOUND, message: 'User not found' };
      }
      const repo = AppDataSource.getRepository(AppUser);
      const user = await repo.findOne({
        where: { id: idNum },
        select: ['id', 'email', 'password', 'fullName', 'phoneNumber', 'isEmailVerified', 'isPhoneVerified', 'lastLoginAt', 'createdAt', 'updatedAt'],
      });
      if (!user) {
        throw {
          statusCode: 404,
          code: ERROR_CODES.NOT_FOUND,
          message: 'User not found',
        };
      }

      // Verify old password
      const isPasswordValid = await user.comparePassword(oldPassword);
      if (!isPasswordValid) {
        throw {
          statusCode: 400,
          code: ERROR_CODES.AUTH_INVALID_CREDENTIALS,
          message: 'Current password is incorrect',
        };
      }

      // Update password (will be hashed by pre-save hook)
      user.password = newPassword;
      await repo.save(user);

      logger.info(`App user password changed: ${id}`);
    } catch (error: any) {
      logger.error('Change password error:', error);
      if (error.statusCode) {
        throw error;
      }
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to change password',
        details: error.message,
      };
    }
  }

  /**
   * Request OTP for change password: verify current password, send OTP to user's phone
   */
  async requestChangePasswordOtp(userId: string, currentPassword: string): Promise<{ phoneMasked: string }> {
    try {
      const idNum = parseInt(userId, 10);
      if (isNaN(idNum)) {
        throw { statusCode: 404, code: ERROR_CODES.NOT_FOUND, message: 'User not found' };
      }
      const repo = AppDataSource.getRepository(AppUser);
      const user = await repo.findOne({
        where: { id: idNum },
        select: ['id', 'email', 'password', 'phoneNumber'],
      });
      if (!user) {
        throw { statusCode: 404, code: ERROR_CODES.NOT_FOUND, message: 'User not found' };
      }

      const isPasswordValid = await user.comparePassword(currentPassword);
      if (!isPasswordValid) {
        throw {
          statusCode: 400,
          code: ERROR_CODES.AUTH_INVALID_CREDENTIALS,
          message: 'Current password is incorrect',
        };
      }

      if (!user.phoneNumber || !user.phoneNumber.trim()) {
        throw {
          statusCode: 400,
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'No phone number registered. Please add a phone number in your profile to use this feature.',
        };
      }

      if (!smsService.isConfigured()) {
        throw {
          statusCode: 503,
          code: ERROR_CODES.DB_OPERATION_FAILED,
          message: 'SMS service is not configured. Please contact support.',
        };
      }

      const otp = crypto.randomInt(100000, 999999).toString();
      await storeChangePasswordOtp(userId, otp);

      const message = `Your Roads Authority verification code for password change is: ${otp}. Valid for 5 minutes.`;
      await smsService.sendSms(user.phoneNumber, message);

      const normalizedPhone = normalizePhone(user.phoneNumber);
      const last3 = normalizedPhone.slice(-3);
      const phoneMasked = `***${last3}`;

      logger.info(`Change password OTP sent to user: ${user.email}`);
      return { phoneMasked };
    } catch (error: any) {
      logger.error('Request change password OTP error:', error);
      if (error.statusCode) {
        throw error;
      }
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to send verification code',
        details: error.message,
      };
    }
  }

  /**
   * Change password using OTP (after send-otp)
   */
  async changePasswordWithOtp(userId: string, otp: string, newPassword: string): Promise<void> {
    try {
      const valid = await verifyAndConsumeChangePasswordOtp(userId, otp);
      if (!valid) {
        throw {
          statusCode: 400,
          code: ERROR_CODES.AUTH_INVALID_CREDENTIALS,
          message: 'Invalid or expired verification code. Please request a new code.',
        };
      }

      const idNum = parseInt(userId, 10);
      if (isNaN(idNum)) {
        throw { statusCode: 404, code: ERROR_CODES.NOT_FOUND, message: 'User not found' };
      }
      const repo = AppDataSource.getRepository(AppUser);
      const user = await repo.findOne({
        where: { id: idNum },
        select: ['id', 'password'],
      });
      if (!user) {
        throw { statusCode: 404, code: ERROR_CODES.NOT_FOUND, message: 'User not found' };
      }

      user.password = newPassword;
      await repo.save(user);

      logger.info(`App user password changed with OTP: ${userId}`);
    } catch (error: any) {
      logger.error('Change password with OTP error:', error);
      if (error.statusCode) {
        throw error;
      }
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to change password',
        details: error.message,
      };
    }
  }

  /**
   * Generate access and refresh tokens
   */
  async generateTokens(user: AppUser): Promise<AuthTokens> {
    const payload: TokenPayload = {
      userId: String(user.id),
      email: user.email,
    };

    const accessToken = jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_ACCESS_EXPIRY as string,
    } as jwt.SignOptions);

    const refreshToken = jwt.sign(
      { userId: String(user.id) },
      env.JWT_SECRET,
      {
        expiresIn: env.JWT_REFRESH_EXPIRY as string,
      } as jwt.SignOptions
    );

    return { accessToken, refreshToken };
  }

  /**
   * Store refresh token in Redis with expiry
   */
  async storeRefreshToken(userId: string, refreshToken: string): Promise<void> {
    try {
      const redisClient = getRedisClient();

      // If Redis is not configured, skip storing
      if (!redisClient) {
        logger.warn('Redis not configured - refresh token not stored');
        return;
      }

      const key = `appuser:token:refresh:${userId}`;

      // Store token with 7 days expiry (604800 seconds)
      await redisClient.setEx(key, 604800, refreshToken);

      logger.debug(`Refresh token stored for app user: ${userId}`);
    } catch (error) {
      logger.error('Error storing refresh token in Redis:', error);
      // Don't throw error - allow login to continue without Redis
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, env.JWT_SECRET) as { userId: string };

      // Check if refresh token exists in Redis (if Redis is configured)
      const redisClient = getRedisClient();

      if (redisClient) {
        const key = `appuser:token:refresh:${decoded.userId}`;
        const storedToken = await redisClient.get(key);

        if (!storedToken || storedToken !== refreshToken) {
          throw {
            code: ERROR_CODES.AUTH_INVALID_TOKEN,
            message: 'Invalid or expired refresh token',
            statusCode: 401,
          };
        }
      } else {
        logger.warn('Redis not configured - skipping refresh token validation');
      }

      const userId = parseInt(decoded.userId, 10);
      const repo = AppDataSource.getRepository(AppUser);
      const user = await repo.findOne({ where: { id: userId } });

      if (!user) {
        throw {
          code: ERROR_CODES.AUTH_INVALID_TOKEN,
          message: 'User not found',
          statusCode: 401,
        };
      }

      const payload: TokenPayload = {
        userId: String(user.id),
        email: user.email,
      };

      const accessToken = jwt.sign(payload, env.JWT_SECRET, {
        expiresIn: env.JWT_ACCESS_EXPIRY as string,
      } as jwt.SignOptions);

      return { accessToken };
    } catch (error: any) {
      logger.error('Refresh token error:', error);
      if (error.statusCode) {
        throw error;
      }
      throw {
        statusCode: 401,
        code: ERROR_CODES.AUTH_INVALID_TOKEN,
        message: 'Invalid or expired refresh token',
        details: error.message,
      };
    }
  }

  /**
   * Logout user (invalidate refresh token)
   */
  async logout(userId: string): Promise<void> {
    try {
      const redisClient = getRedisClient();

      if (redisClient) {
        const key = `appuser:token:refresh:${userId}`;
        // Use timeout-protected Redis delete (2 second timeout)
        const deleted = await safeRedisDel(redisClient, key, 2000);
        if (deleted) {
          logger.info(`App user logged out: ${userId}`);
        } else {
          logger.warn(`App user logout: Redis operation timed out or failed for user ${userId}, but logout continues`);
        }
      } else {
        logger.warn('Redis not configured - cannot invalidate refresh token');
      }
      // Logout succeeds regardless of Redis status
    } catch (error: any) {
      logger.error('Logout error:', error);
      // Don't throw error - logout should succeed even if Redis fails
    }
  }

  /**
   * Generate secure email verification token
   */
  generateEmailVerificationToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Verify email using token. Returns user and tokens for auto-login.
   */
  async verifyEmail(token: string): Promise<{ user: AppUser; tokens: AuthTokens }> {
    try {
      const repo = AppDataSource.getRepository(AppUser);
      const user = await repo.findOne({
        where: { emailVerificationToken: token },
      });

      if (!user) {
        throw {
          statusCode: 400,
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Invalid verification token',
        };
      }

      if (user.emailVerificationTokenExpiry && user.emailVerificationTokenExpiry < new Date()) {
        throw {
          statusCode: 400,
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Verification token has expired',
        };
      }

      if (user.isEmailVerified) {
        throw {
          statusCode: 400,
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Email is already verified',
        };
      }

      user.isEmailVerified = true;
      user.emailVerifiedAt = new Date();
      user.emailVerificationToken = null;
      user.emailVerificationTokenExpiry = null;
      await repo.save(user);

      logger.info(`Email verified for user: ${user.email}`);

      try {
        await emailService.sendWelcomeEmail(user.email, user.fullName ?? undefined);
      } catch (emailError: any) {
        logger.error('Failed to send welcome email:', emailError);
      }

      const tokens = await this.generateTokens(user);
      await this.storeRefreshToken(String(user.id), tokens.refreshToken);

      const { password: _, emailVerificationToken: __, ...rest } = user;
      return { user: rest as AppUser, tokens };
    } catch (error: any) {
      logger.error('Verify email error:', error);
      if (error.statusCode) {
        throw error;
      }
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to verify email',
        details: error.message,
      };
    }
  }

  /**
   * Resend verification email
   */
  async resendVerificationEmail(email: string): Promise<void> {
    try {
      const repo = AppDataSource.getRepository(AppUser);
      const user = await repo.findOne({
        where: { email: email.toLowerCase().trim() },
        select: ['id', 'email', 'fullName', 'isEmailVerified', 'emailVerificationToken'],
      });

      if (!user) {
        throw {
          statusCode: 404,
          code: ERROR_CODES.NOT_FOUND,
          message: 'User not found',
        };
      }

      if (user.isEmailVerified) {
        throw {
          statusCode: 400,
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Email is already verified',
        };
      }

      const verificationToken = this.generateEmailVerificationToken();
      const tokenExpiry = new Date();
      tokenExpiry.setHours(tokenExpiry.getHours() + 24);

      user.emailVerificationToken = verificationToken;
      user.emailVerificationTokenExpiry = tokenExpiry;
      await repo.save(user);

      await emailService.sendVerificationEmail(
        user.email,
        user.fullName ?? undefined,
        verificationToken
      );

      logger.info(`Verification email resent to: ${user.email}`);
    } catch (error: any) {
      logger.error('Resend verification email error:', error);
      if (error.statusCode) {
        throw error;
      }
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to resend verification email',
        details: error.message,
      };
    }
  }

  /**
   * Request password reset: send OTP to user's registered phone via SMS
   */
  async requestPasswordReset(email: string): Promise<{ phoneMasked: string }> {
    try {
      const repo = AppDataSource.getRepository(AppUser);
      const user = await repo.findOne({
        where: { email: email.toLowerCase().trim() },
        select: ['id', 'email', 'phoneNumber'],
      });

      if (!user) {
        // Don't reveal that user doesn't exist (prevent email enumeration)
        return { phoneMasked: '***', phone: null };
      }

      if (!user.phoneNumber || !user.phoneNumber.trim()) {
        throw {
          statusCode: 400,
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Phone number not registered. Please contact support for password reset.',
        };
      }

      if (!smsService.isConfigured()) {
        throw {
          statusCode: 503,
          code: ERROR_CODES.DB_OPERATION_FAILED,
          message: 'SMS service is not configured. Please contact support.',
        };
      }

      const otp = crypto.randomInt(100000, 999999).toString();
      const normalizedPhone = normalizePhone(user.phoneNumber);

      await storeOtp(user.phoneNumber, otp, user.email);

      const message = `Your Roads Authority verification code is: ${otp}. Valid for 5 minutes.`;
      await smsService.sendSms(user.phoneNumber, message);

      const last3 = normalizedPhone.slice(-3);
      const phoneMasked = `***${last3}`;

      logger.info(`Password reset OTP sent to user: ${user.email}`);

      // Return phone for client to use in verify-otp (needed for Redis lookup)
      return { phoneMasked, phone: user.phoneNumber };
    } catch (error: any) {
      logger.error('Request password reset error:', error);
      if (error.statusCode) {
        throw error;
      }
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to send verification code',
        details: error.message,
      };
    }
  }

  /**
   * Verify OTP and return short-lived reset token
   */
  async verifyOtpAndGetResetToken(phone: string, otp: string): Promise<{ resetToken: string }> {
    try {
      const email = await verifyAndConsumeOtp(phone, otp);

      if (!email) {
        throw {
          statusCode: 400,
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Invalid or expired verification code. Please request a new one.',
        };
      }

      const payload = {
        purpose: 'password_reset',
        email,
      };

      const resetToken = jwt.sign(payload, env.JWT_SECRET, {
        expiresIn: env.PASSWORD_RESET_TOKEN_EXPIRY as string,
      } as jwt.SignOptions);

      return { resetToken };
    } catch (error: any) {
      logger.error('Verify OTP error:', error);
      if (error.statusCode) {
        throw error;
      }
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to verify code',
        details: error.message,
      };
    }
  }

  /**
   * Reset password using reset token
   */
  async resetPasswordWithToken(token: string, newPassword: string): Promise<void> {
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as { purpose?: string; email?: string };

      if (decoded.purpose !== 'password_reset' || !decoded.email) {
        throw {
          statusCode: 400,
          code: ERROR_CODES.AUTH_INVALID_TOKEN,
          message: 'Invalid or expired reset link. Please request a new password reset.',
        };
      }

      const repo = AppDataSource.getRepository(AppUser);
      const user = await repo.findOne({ where: { email: decoded.email } });

      if (!user) {
        throw {
          statusCode: 404,
          code: ERROR_CODES.NOT_FOUND,
          message: 'User not found',
        };
      }

      if (newPassword.length < 8) {
        throw {
          statusCode: 400,
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Password must be at least 8 characters',
        };
      }

      user.password = newPassword;
      await repo.save(user);

      logger.info(`Password reset completed for user: ${user.email}`);
    } catch (error: any) {
      logger.error('Reset password error:', error);
      if (error.statusCode) {
        throw error;
      }
      if (error.name === 'TokenExpiredError') {
        throw {
          statusCode: 400,
          code: ERROR_CODES.AUTH_INVALID_TOKEN,
          message: 'Reset link has expired. Please request a new password reset.',
        };
      }
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to reset password',
        details: error.message,
      };
    }
  }
}

export const appUsersService = new AppUsersService();

