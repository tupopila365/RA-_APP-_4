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

import { authenticate } from '../auth';
import jwt from 'jsonwebtoken';

describe('Auth Middleware', () => {
  let req: any;
  let res: any;
  let next: jest.Mock;

  beforeEach(() => {
    req = {
      headers: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  describe('authenticate', () => {
    it('should authenticate with valid token', async () => {
      const token = jwt.sign(
        {
          userId: 'user123',
          email: 'test@example.com',
          role: 'admin',
          permissions: ['news:manage'],
        },
        process.env.JWT_SECRET!,
        { expiresIn: '15m' }
      );

      req.headers.authorization = `Bearer ${token}`;

      await authenticate(req, res, next);

      expect(req.user).toBeDefined();
      expect(req.user.userId).toBe('user123');
      expect(req.user.email).toBe('test@example.com');
      expect(req.user.role).toBe('admin');
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should reject request without authorization header', async () => {
      await authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            message: 'No token provided',
          }),
        })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject request with malformed authorization header', async () => {
      req.headers.authorization = 'InvalidFormat token';

      await authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            message: 'No token provided',
          }),
        })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject expired token', async () => {
      const expiredToken = jwt.sign(
        {
          userId: 'user123',
          email: 'test@example.com',
          role: 'admin',
          permissions: [],
        },
        process.env.JWT_SECRET!,
        { expiresIn: '-1s' }
      );

      req.headers.authorization = `Bearer ${expiredToken}`;

      await authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            message: 'Token expired',
          }),
        })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject invalid token', async () => {
      req.headers.authorization = 'Bearer invalid-token';

      await authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            message: 'Invalid token',
          }),
        })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject token signed with wrong secret', async () => {
      const token = jwt.sign(
        {
          userId: 'user123',
          email: 'test@example.com',
          role: 'admin',
          permissions: [],
        },
        'wrong-secret',
        { expiresIn: '15m' }
      );

      req.headers.authorization = `Bearer ${token}`;

      await authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            message: 'Invalid token',
          }),
        })
      );
      expect(next).not.toHaveBeenCalled();
    });
  });
});
