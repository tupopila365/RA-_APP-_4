// Set up environment variables before imports
process.env.NODE_ENV = 'test';
process.env.PORT = '3000';
process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
process.env.REDIS_URL = 'redis://localhost:6379';
process.env.JWT_SECRET = 'test-secret';
process.env.JWT_ACCESS_EXPIRY = '15m';
process.env.JWT_REFRESH_EXPIRY = '7d';
process.env.CLOUDINARY_CLOUD_NAME = 'test';
process.env.CLOUDINARY_API_KEY = 'test';
process.env.CLOUDINARY_API_SECRET = 'test';
process.env.RAG_SERVICE_URL = 'http://localhost:8000';
process.env.CORS_ORIGIN = 'http://localhost:3001';

import { authService } from '../auth.service';
import { User } from '../auth.model';
import { getRedisClient } from '../../../config/redis';
import jwt from 'jsonwebtoken';

// Mock dependencies
jest.mock('../auth.model');
jest.mock('../../../config/redis');
jest.mock('../../../utils/logger');

describe('AuthService', () => {
  let mockRedisClient: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup Redis mock
    mockRedisClient = {
      setEx: jest.fn().mockResolvedValue('OK'),
      get: jest.fn().mockResolvedValue(null),
      del: jest.fn().mockResolvedValue(1),
    };
    (getRedisClient as jest.Mock).mockReturnValue(mockRedisClient);
  });

  describe('login', () => {
    it('should successfully login with valid credentials', async () => {
      const mockUser = {
        _id: 'user123',
        email: 'test@example.com',
        role: 'admin',
        permissions: ['news:manage'],
        comparePassword: jest.fn().mockResolvedValue(true),
      };

      (User.findOne as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });

      const result = await authService.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.user).toBeDefined();
      expect(result.tokens).toBeDefined();
      expect(result.tokens.accessToken).toBeDefined();
      expect(result.tokens.refreshToken).toBeDefined();
      expect(mockRedisClient.setEx).toHaveBeenCalled();
    });

    it('should throw error for non-existent user', async () => {
      (User.findOne as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      });

      await expect(
        authService.login({
          email: 'nonexistent@example.com',
          password: 'password123',
        })
      ).rejects.toMatchObject({
        message: 'Invalid email or password',
        statusCode: 401,
      });
    });

    it('should throw error for invalid password', async () => {
      const mockUser = {
        _id: 'user123',
        email: 'test@example.com',
        comparePassword: jest.fn().mockResolvedValue(false),
      };

      (User.findOne as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });

      await expect(
        authService.login({
          email: 'test@example.com',
          password: 'wrongpassword',
        })
      ).rejects.toMatchObject({
        message: 'Invalid email or password',
        statusCode: 401,
      });
    });
  });

  describe('generateTokens', () => {
    it('should generate valid access and refresh tokens', async () => {
      const mockUser: any = {
        _id: 'user123',
        email: 'test@example.com',
        role: 'admin',
        permissions: ['news:manage'],
      };

      const tokens = await authService.generateTokens(mockUser);

      expect(tokens.accessToken).toBeDefined();
      expect(tokens.refreshToken).toBeDefined();

      // Verify access token payload
      const accessPayload = jwt.decode(tokens.accessToken) as any;
      expect(accessPayload.userId).toBe('user123');
      expect(accessPayload.email).toBe('test@example.com');
      expect(accessPayload.role).toBe('admin');
      expect(accessPayload.permissions).toContain('news:manage');

      // Verify refresh token payload
      const refreshPayload = jwt.decode(tokens.refreshToken) as any;
      expect(refreshPayload.userId).toBe('user123');
    });
  });

  describe('storeRefreshToken', () => {
    it('should store refresh token in Redis with correct expiry', async () => {
      await authService.storeRefreshToken('user123', 'refresh-token');

      expect(mockRedisClient.setEx).toHaveBeenCalledWith(
        'token:refresh:user123',
        604800,
        'refresh-token'
      );
    });

    it('should not throw error if Redis operation fails (graceful degradation)', async () => {
      mockRedisClient.setEx.mockRejectedValue(new Error('Redis error'));

      // Should not throw - gracefully continues without Redis
      await expect(
        authService.storeRefreshToken('user123', 'refresh-token')
      ).resolves.toBeUndefined();
    });
  });

  describe('refreshAccessToken', () => {
    it('should generate new access token with valid refresh token', async () => {
      const mockUser: any = {
        _id: 'user123',
        email: 'test@example.com',
        role: 'admin',
        permissions: ['news:manage'],
      };

      const refreshToken = jwt.sign(
        { userId: 'user123' },
        process.env.JWT_SECRET!,
        { expiresIn: '7d' }
      );

      mockRedisClient.get.mockResolvedValue(refreshToken);
      (User.findById as jest.Mock).mockResolvedValue(mockUser);

      const result = await authService.refreshAccessToken(refreshToken);

      expect(result.accessToken).toBeDefined();
      
      const payload = jwt.decode(result.accessToken) as any;
      expect(payload.userId).toBe('user123');
      expect(payload.email).toBe('test@example.com');
    });

    it('should throw error if refresh token not found in Redis', async () => {
      const refreshToken = jwt.sign(
        { userId: 'user123' },
        process.env.JWT_SECRET!,
        { expiresIn: '7d' }
      );

      mockRedisClient.get.mockResolvedValue(null);

      await expect(
        authService.refreshAccessToken(refreshToken)
      ).rejects.toMatchObject({
        message: 'Invalid or expired refresh token',
        statusCode: 401,
      });
    });

    it('should throw error if refresh token does not match stored token', async () => {
      const refreshToken = jwt.sign(
        { userId: 'user123' },
        process.env.JWT_SECRET!,
        { expiresIn: '7d' }
      );

      mockRedisClient.get.mockResolvedValue('different-token');

      await expect(
        authService.refreshAccessToken(refreshToken)
      ).rejects.toMatchObject({
        message: 'Invalid or expired refresh token',
        statusCode: 401,
      });
    });

    it('should throw error if user not found', async () => {
      const refreshToken = jwt.sign(
        { userId: 'user123' },
        process.env.JWT_SECRET!,
        { expiresIn: '7d' }
      );

      mockRedisClient.get.mockResolvedValue(refreshToken);
      (User.findById as jest.Mock).mockResolvedValue(null);

      await expect(
        authService.refreshAccessToken(refreshToken)
      ).rejects.toMatchObject({
        message: 'User not found',
        statusCode: 401,
      });
    });

    it('should throw error for expired refresh token', async () => {
      const expiredToken = jwt.sign(
        { userId: 'user123' },
        process.env.JWT_SECRET!,
        { expiresIn: '-1s' }
      );

      await expect(
        authService.refreshAccessToken(expiredToken)
      ).rejects.toMatchObject({
        message: 'Refresh token expired',
        statusCode: 401,
      });
    });

    it('should throw error for invalid refresh token', async () => {
      await expect(
        authService.refreshAccessToken('invalid-token')
      ).rejects.toMatchObject({
        message: 'Invalid refresh token',
        statusCode: 401,
      });
    });
  });

  describe('logout', () => {
    it('should remove refresh token from Redis', async () => {
      await authService.logout('user123');

      expect(mockRedisClient.del).toHaveBeenCalledWith('token:refresh:user123');
    });

    it('should throw error if Redis operation fails', async () => {
      mockRedisClient.del.mockRejectedValue(new Error('Redis error'));

      await expect(authService.logout('user123')).rejects.toMatchObject({
        message: 'Failed to logout',
        statusCode: 500,
      });
    });
  });

  describe('verifyRefreshToken', () => {
    it('should return true for valid refresh token', async () => {
      mockRedisClient.get.mockResolvedValue('valid-token');

      const result = await authService.verifyRefreshToken('user123', 'valid-token');

      expect(result).toBe(true);
      expect(mockRedisClient.get).toHaveBeenCalledWith('token:refresh:user123');
    });

    it('should return false for invalid refresh token', async () => {
      mockRedisClient.get.mockResolvedValue('different-token');

      const result = await authService.verifyRefreshToken('user123', 'invalid-token');

      expect(result).toBe(false);
    });

    it('should return false if token not found in Redis', async () => {
      mockRedisClient.get.mockResolvedValue(null);

      const result = await authService.verifyRefreshToken('user123', 'any-token');

      expect(result).toBe(false);
    });

    it('should return false if Redis operation fails', async () => {
      mockRedisClient.get.mockRejectedValue(new Error('Redis error'));

      const result = await authService.verifyRefreshToken('user123', 'any-token');

      expect(result).toBe(false);
    });
  });
});
