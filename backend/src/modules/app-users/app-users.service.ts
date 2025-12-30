import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { AppUser, IAppUser } from './app-users.model';
import { RegisterDTO, LoginDTO, UpdateProfileDTO, ChangePasswordDTO } from './app-users.dto';
import { logger } from '../../utils/logger';
import { ERROR_CODES } from '../../constants/errors';
import { env } from '../../config/env';
import { getRedisClient } from '../../config/redis';
import { emailService } from '../../services/email.service';

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
  async register(dto: RegisterDTO): Promise<{ user: IAppUser; tokens: AuthTokens }> {
    try {
      const { email, password, fullName, phoneNumber } = dto;

      // Check if user already exists
      const existingUser = await AppUser.findOne({ email });
      if (existingUser) {
        throw {
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'User with this email already exists',
          statusCode: 409,
        };
      }

      // Generate email verification token
      const verificationToken = this.generateEmailVerificationToken();
      const tokenExpiry = new Date();
      tokenExpiry.setHours(tokenExpiry.getHours() + 24); // 24 hours expiry

      // Create user
      const user = await AppUser.create({
        email: email.toLowerCase().trim(),
        password,
        fullName: fullName?.trim(),
        phoneNumber: phoneNumber?.trim(),
        isEmailVerified: false,
        emailVerificationToken: verificationToken,
        emailVerificationTokenExpiry: tokenExpiry,
      });

      // Send verification email
      try {
        await emailService.sendVerificationEmail(
          user.email,
          user.fullName,
          verificationToken
        );
        logger.info(`Verification email sent to: ${user.email}`);
      } catch (emailError: any) {
        logger.error('Failed to send verification email:', emailError);
        // Don't fail registration if email fails, but log it
      }

      // Generate tokens (user can still login, but email verification is required)
      const tokens = await this.generateTokens(user);

      // Store refresh token
      await this.storeRefreshToken(user._id.toString(), tokens.refreshToken);

      logger.info(`New app user registered: ${user.email}`);

      // Return user without password
      const userObject = user.toObject();
      delete (userObject as any).password;
      delete (userObject as any).emailVerificationToken;

      return { user: userObject as IAppUser, tokens };
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
  async login(credentials: LoginDTO): Promise<{ user: IAppUser; tokens: AuthTokens }> {
    try {
      const { email, password } = credentials;

      // Find user with password field included
      const user = await AppUser.findOne({ email: email.toLowerCase().trim() }).select('+password');

      if (!user) {
        throw {
          code: ERROR_CODES.AUTH_INVALID_CREDENTIALS,
          message: 'Invalid email or password',
          statusCode: 401,
        };
      }

      // Verify password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        throw {
          code: ERROR_CODES.AUTH_INVALID_CREDENTIALS,
          message: 'Invalid email or password',
          statusCode: 401,
        };
      }

      // Generate tokens
      const tokens = await this.generateTokens(user);

      // Store refresh token
      await this.storeRefreshToken(user._id.toString(), tokens.refreshToken);

      // Update last login
      user.lastLoginAt = new Date();
      await user.save();

      logger.info(`App user logged in: ${user.email}`);

      // Return user without password
      const userObject = user.toObject();
      delete (userObject as any).password;

      return { user: userObject as IAppUser, tokens };
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
  async getUserById(id: string): Promise<IAppUser> {
    try {
      const user = await AppUser.findById(id).lean();

      if (!user) {
        throw {
          statusCode: 404,
          code: ERROR_CODES.NOT_FOUND,
          message: 'User not found',
        };
      }

      return user as unknown as IAppUser;
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
  async updateUser(id: string, dto: UpdateProfileDTO): Promise<IAppUser> {
    try {
      const updateData: any = {};

      if (dto.fullName !== undefined) {
        updateData.fullName = dto.fullName?.trim();
      }
      if (dto.phoneNumber !== undefined) {
        updateData.phoneNumber = dto.phoneNumber?.trim();
      }

      const user = await AppUser.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      }).lean();

      if (!user) {
        throw {
          statusCode: 404,
          code: ERROR_CODES.NOT_FOUND,
          message: 'User not found',
        };
      }

      logger.info(`App user profile updated: ${id}`);
      return user as unknown as IAppUser;
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
      const user = await AppUser.findById(id).select('+password');
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
      await user.save();

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
  async generateTokens(user: IAppUser): Promise<AuthTokens> {
    const payload: TokenPayload = {
      userId: user._id.toString(),
      email: user.email,
    };

    // Generate access token (15 minutes)
    const accessToken = jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_ACCESS_EXPIRY as string,
    } as jwt.SignOptions);

    // Generate refresh token (7 days)
    const refreshToken = jwt.sign(
      { userId: user._id.toString() },
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

      // Get user details
      const user = await AppUser.findById(decoded.userId);

      if (!user) {
        throw {
          code: ERROR_CODES.AUTH_INVALID_TOKEN,
          message: 'User not found',
          statusCode: 401,
        };
      }

      // Generate new access token
      const payload: TokenPayload = {
        userId: user._id.toString(),
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
        await redisClient.del(key);
        logger.info(`App user logged out: ${userId}`);
      } else {
        logger.warn('Redis not configured - cannot invalidate refresh token');
      }
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
  async verifyEmail(token: string): Promise<IAppUser> {
    try {
      // Find user by verification token
      const user = await AppUser.findOne({
        emailVerificationToken: token,
      }).select('+emailVerificationToken');

      if (!user) {
        throw {
          statusCode: 400,
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Invalid verification token',
        };
      }

      // Check if token is expired
      if (user.emailVerificationTokenExpiry && user.emailVerificationTokenExpiry < new Date()) {
        throw {
          statusCode: 400,
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Verification token has expired',
        };
      }

      // Check if already verified
      if (user.isEmailVerified) {
        throw {
          statusCode: 400,
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Email is already verified',
        };
      }

      // Verify email
      user.isEmailVerified = true;
      user.emailVerifiedAt = new Date();
      user.emailVerificationToken = undefined;
      user.emailVerificationTokenExpiry = undefined;
      await user.save();

      logger.info(`Email verified for user: ${user.email}`);

      // Send welcome email
      try {
        await emailService.sendWelcomeEmail(user.email, user.fullName);
      } catch (emailError: any) {
        logger.error('Failed to send welcome email:', emailError);
        // Don't fail verification if welcome email fails
      }

      // Return user without sensitive fields
      const userObject = user.toObject();
      delete (userObject as any).password;
      delete (userObject as any).emailVerificationToken;

      return userObject as IAppUser;
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
      const user = await AppUser.findOne({ email: email.toLowerCase().trim() }).select('+emailVerificationToken');

      if (!user) {
        throw {
          statusCode: 404,
          code: ERROR_CODES.NOT_FOUND,
          message: 'User not found',
        };
      }

      // Check if already verified
      if (user.isEmailVerified) {
        throw {
          statusCode: 400,
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Email is already verified',
        };
      }

      // Generate new verification token
      const verificationToken = this.generateEmailVerificationToken();
      const tokenExpiry = new Date();
      tokenExpiry.setHours(tokenExpiry.getHours() + 24); // 24 hours expiry

      // Update user with new token
      user.emailVerificationToken = verificationToken;
      user.emailVerificationTokenExpiry = tokenExpiry;
      await user.save();

      // Send verification email
      await emailService.sendVerificationEmail(
        user.email,
        user.fullName,
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

