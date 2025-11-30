import jwt from 'jsonwebtoken';
import { User, IUser } from './auth.model';
import { getRedisClient } from '../../config/redis';
import { env } from '../../config/env';
import { logger } from '../../utils/logger';
import { ERROR_CODES } from '../../constants/errors';

interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  permissions: string[];
}

export class AuthService {
  /**
   * Authenticate user with email and password
   */
  async login(credentials: LoginCredentials): Promise<{ user: IUser; tokens: AuthTokens }> {
    const { email, password } = credentials;

    // Find user with password field included
    const user = await User.findOne({ email }).select('+password');

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

    // Store refresh token in Redis
    await this.storeRefreshToken(user._id.toString(), tokens.refreshToken);

    logger.info(`User logged in: ${user.email}`);

    return { user, tokens };
  }

  /**
   * Generate access and refresh tokens
   */
  async generateTokens(user: IUser): Promise<AuthTokens> {
    const payload: TokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      permissions: user.permissions,
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
      
      // If Redis is not configured, skip storing (tokens will still work but won't be invalidated on logout)
      if (!redisClient) {
        logger.warn('Redis not configured - refresh token not stored (logout will not invalidate tokens)');
        return;
      }
      
      const key = `token:refresh:${userId}`;
      
      // Store token with 7 days expiry (604800 seconds)
      await redisClient.setEx(key, 604800, refreshToken);
      
      logger.debug(`Refresh token stored for user: ${userId}`);
    } catch (error) {
      logger.error('Error storing refresh token in Redis:', error);
      // Don't throw error - allow login to continue without Redis
      logger.warn('Continuing without Redis - refresh tokens will not be invalidated on logout');
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
        const key = `token:refresh:${decoded.userId}`;
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
      const user = await User.findById(decoded.userId);

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
        role: user.role,
        permissions: user.permissions,
      };

      const accessToken = jwt.sign(payload, env.JWT_SECRET, {
        expiresIn: env.JWT_ACCESS_EXPIRY as string,
      } as jwt.SignOptions);

      logger.info(`Access token refreshed for user: ${user.email}`);

      return { accessToken };
    } catch (error: any) {
      if (error instanceof jwt.TokenExpiredError) {
        throw {
          code: ERROR_CODES.AUTH_TOKEN_EXPIRED,
          message: 'Refresh token expired',
          statusCode: 401,
        };
      }

      if (error instanceof jwt.JsonWebTokenError) {
        throw {
          code: ERROR_CODES.AUTH_INVALID_TOKEN,
          message: 'Invalid refresh token',
          statusCode: 401,
        };
      }

      throw error;
    }
  }

  /**
   * Logout user by removing refresh token from Redis
   */
  async logout(userId: string): Promise<void> {
    try {
      const redisClient = getRedisClient();
      const key = `token:refresh:${userId}`;
      
      if (redisClient) {
        await redisClient.del(key);
      }
      
      logger.info(`User logged out: ${userId}`);
    } catch (error) {
      logger.error('Error removing refresh token from Redis:', error);
      throw {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to logout',
        statusCode: 500,
      };
    }
  }

  /**
   * Verify if a refresh token is valid
   */
  async verifyRefreshToken(userId: string, refreshToken: string): Promise<boolean> {
    try {
      const redisClient = getRedisClient();
      if (!redisClient) {
        return false;
      }
      const key = `token:refresh:${userId}`;
      const storedToken = await redisClient.get(key);

      return storedToken === refreshToken;
    } catch (error) {
      logger.error('Error verifying refresh token:', error);
      return false;
    }
  }
}

export const authService = new AuthService();
