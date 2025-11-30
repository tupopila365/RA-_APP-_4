// Set up environment variables before imports
process.env.NODE_ENV = 'test';
process.env.PORT = '3000';
process.env.MONGODB_URI = 'mongodb://localhost:27017/test-integration';
process.env.REDIS_URL = 'redis://localhost:6379';
process.env.JWT_SECRET = 'test-secret-integration';
process.env.JWT_ACCESS_EXPIRY = '15m';
process.env.JWT_REFRESH_EXPIRY = '7d';
process.env.CLOUDINARY_CLOUD_NAME = 'test';
process.env.CLOUDINARY_API_KEY = 'test';
process.env.CLOUDINARY_API_SECRET = 'test';
process.env.RAG_SERVICE_URL = 'http://localhost:8000';
process.env.CORS_ORIGIN = 'http://localhost:3001';

import request from 'supertest';
import { app } from '../../app';
import { User } from '../../modules/auth/auth.model';
import { connectDB, disconnectDB } from '../../config/db';
import { getRedisClient } from '../../config/redis';

describe('Upload Authentication Integration Tests', () => {
  let validToken: string;
  let userWithoutPermission: string;

  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await disconnectDB();
    const redis = getRedisClient();
    if (redis) {
      await redis.quit();
    }
  });

  beforeEach(async () => {
    // Clean up database before each test
    await User.deleteMany({});

    // Create a user with upload permissions
    const userWithPermission = new User({
      email: 'uploader@example.com',
      password: 'password123',
      role: 'admin',
      permissions: ['documents:upload'],
    });
    await userWithPermission.save();

    // Login to get token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'uploader@example.com',
        password: 'password123',
      });

    validToken = loginResponse.body.data.accessToken;

    // Create a user without upload permissions
    const userWithoutPerms = new User({
      email: 'noupload@example.com',
      password: 'password123',
      role: 'admin',
      permissions: ['news:manage'], // Different permission
    });
    await userWithoutPerms.save();

    // Login to get token for user without permissions
    const loginResponse2 = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'noupload@example.com',
        password: 'password123',
      });

    userWithoutPermission = loginResponse2.body.data.accessToken;
  });

  describe('POST /api/upload/pdf - Authentication', () => {
    it('should reject unauthenticated requests with 401', async () => {
      const response = await request(app)
        .post('/api/upload/pdf')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('No token provided');
    });

    it('should reject requests with invalid token with 401', async () => {
      const response = await request(app)
        .post('/api/upload/pdf')
        .set('Authorization', 'Bearer invalid-token-here')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('Invalid token');
    });

    it('should reject requests with malformed authorization header with 401', async () => {
      const response = await request(app)
        .post('/api/upload/pdf')
        .set('Authorization', 'InvalidFormat token')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('No token provided');
    });

    it('should accept authenticated requests with valid token', async () => {
      // Create a minimal PDF buffer
      const pdfBuffer = Buffer.from('%PDF-1.4\n%EOF');

      const response = await request(app)
        .post('/api/upload/pdf')
        .set('Authorization', `Bearer ${validToken}`)
        .attach('file', pdfBuffer, 'test.pdf');

      // Should not return 401 (may return other errors like validation or Cloudinary errors)
      expect(response.status).not.toBe(401);
    });
  });

  describe('DELETE /api/upload/pdf - Authentication', () => {
    it('should reject unauthenticated delete requests with 401', async () => {
      const response = await request(app)
        .delete('/api/upload/pdf')
        .send({ publicId: 'test-public-id' })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('No token provided');
    });

    it('should accept authenticated delete requests with valid token', async () => {
      const response = await request(app)
        .delete('/api/upload/pdf')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ publicId: 'test-public-id' });

      // Should not return 401 (may return other errors)
      expect(response.status).not.toBe(401);
    });
  });

  describe('POST /api/upload/pdf - Authorization', () => {
    it('should reject requests from users without documents:upload permission with 403', async () => {
      // Create a minimal PDF buffer
      const pdfBuffer = Buffer.from('%PDF-1.4\n%EOF');

      const response = await request(app)
        .post('/api/upload/pdf')
        .set('Authorization', `Bearer ${userWithoutPermission}`)
        .attach('file', pdfBuffer, 'test.pdf')
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('Insufficient permissions');
      expect(response.body.error.details.required).toBe('documents:upload');
    });

    it('should accept requests from users with documents:upload permission', async () => {
      // Create a minimal PDF buffer
      const pdfBuffer = Buffer.from('%PDF-1.4\n%EOF');

      const response = await request(app)
        .post('/api/upload/pdf')
        .set('Authorization', `Bearer ${validToken}`)
        .attach('file', pdfBuffer, 'test.pdf');

      // Should not return 403 (may return other errors like validation or Cloudinary errors)
      expect(response.status).not.toBe(403);
    });

    it('should accept requests from super-admin users regardless of permissions', async () => {
      // Create a super-admin user
      const superAdmin = new User({
        email: 'superadmin@example.com',
        password: 'password123',
        role: 'super-admin',
        permissions: [], // Super-admin doesn't need explicit permissions
      });
      await superAdmin.save();

      // Login as super-admin
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'superadmin@example.com',
          password: 'password123',
        });

      const superAdminToken = loginResponse.body.data.accessToken;

      // Create a minimal PDF buffer
      const pdfBuffer = Buffer.from('%PDF-1.4\n%EOF');

      const response = await request(app)
        .post('/api/upload/pdf')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .attach('file', pdfBuffer, 'test.pdf');

      // Should not return 403 (may return other errors)
      expect(response.status).not.toBe(403);
    });
  });

  describe('DELETE /api/upload/pdf - Authorization', () => {
    it('should reject delete requests from users without documents:upload permission with 403', async () => {
      const response = await request(app)
        .delete('/api/upload/pdf')
        .set('Authorization', `Bearer ${userWithoutPermission}`)
        .send({ publicId: 'test-public-id' })
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('Insufficient permissions');
    });

    it('should accept delete requests from users with documents:upload permission', async () => {
      const response = await request(app)
        .delete('/api/upload/pdf')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ publicId: 'test-public-id' });

      // Should not return 403 (may return other errors)
      expect(response.status).not.toBe(403);
    });
  });
});
