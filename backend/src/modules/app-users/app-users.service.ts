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
   */
  async register(dto: RegisterDTO): Promise<{ user: AppUser; tokens: AuthTokens }> {
    try {
      const { email, password, fullName, phoneNumber } = dto;
      const repo = AppDataSource.getRepository(AppUser);

      const existingUser = await repo.findOne({ where: { email: email.toLowerCase().trim() } });
      if (existingUser) {
        throw {
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'User with this email already exists',
          statusCode: 409,
        };
      }

      const user = repo.create({
        email: email.toLowerCase().trim(),
        password,
        fullName: fullName?.trim() ?? null,
        phoneNumber: phoneNumber?.trim() ?? null,
        isEmailVerified: true,
        emailVerifiedAt: new Date(),
      });

      const saved = await repo.save(user);
      const tokens = await this.generateTokens(saved);
      await this.storeRefreshToken(saved.id.toString(), tokens.refreshToken);

      logger.info(`New app user registered: ${saved.email}`);

      const { password: _, emailVerificationToken: __, ...rest } = saved;
      return { user: rest as AppUser, tokens };
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
   * Login app user
   */
  async login(credentials: LoginDTO): Promise<{ user: AppUser; tokens: AuthTokens }> {
    try {
      const { email, password } = credentials;
      const repo = AppDataSource.getRepository(AppUser);
      const user = await repo.findOne({
        where: { email: email.toLowerCase().trim() },
        select: ['id', 'email', 'password', 'fullName', 'phoneNumber', 'isEmailVerified', 'lastLoginAt', 'createdAt', 'updatedAt'],
      });

      if (!user) {
        throw {
          code: ERROR_CODES.AUTH_INVALID_CREDENTIALS,
          message: 'Invalid email or password',
          statusCode: 401,
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
        select: ['id', 'email', 'fullName', 'phoneNumber', 'isEmailVerified', 'emailVerifiedAt', 'lastLoginAt', 'createdAt', 'updatedAt'],
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
      const user = await repo.findOne({ where: { id: idNum } });
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
   * Verify email using token
   */
  async verifyEmail(token: string): Promise<AppUser> {
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

      const { password: _, emailVerificationToken: __, ...rest } = user;
      return rest as AppUser;
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
}

export const appUsersService = new AppUsersService();

