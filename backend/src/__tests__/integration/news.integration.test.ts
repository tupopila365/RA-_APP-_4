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
import { NewsModel } from '../../modules/news/news.model';
import { connectDB, disconnectDB } from '../../config/db';
import { getRedisClient } from '../../config/redis';

describe('News Integration Tests', () => {
  let accessToken: string;
  let userId: string;

  beforeAll(async () => {
    await connectDB();

    // Create test user and get token
    const user = new User({
      email: 'test@example.com',
      password: 'password123',
      role: 'admin',
      permissions: ['news:manage'],
    });
    await user.save();
    userId = user._id.toString();

    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123',
      });

    accessToken = loginResponse.body.data.accessToken;
  });

  afterAll(async () => {
    await User.deleteMany({});
    await disconnectDB();
    const redis = getRedisClient();
    if (redis) {
      await redis.quit();
    }
  });

  beforeEach(async () => {
    // Clean up news before each test
    await NewsModel.deleteMany({});
  });

  describe('POST /api/news', () => {
    it('should create news article with valid data', async () => {
      const response = await request(app)
        .post('/api/news')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'Test News',
          content: 'Test content for news article',
          excerpt: 'Test excerpt',
          category: 'general',
          author: 'Test Author',
          published: false,
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.news.title).toBe('Test News');
      expect(response.body.data.news.id).toBeDefined();
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/news')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'Test News',
          // Missing content, excerpt, category, author
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 401 without authentication', async () => {
      await request(app)
        .post('/api/news')
        .send({
          title: 'Test News',
          content: 'Test content',
          excerpt: 'Test excerpt',
          category: 'general',
          author: 'Test Author',
        })
        .expect(401);
    });
  });

  describe('GET /api/news', () => {
    it('should list news articles with pagination', async () => {
      // Create test news articles
      await NewsModel.create([
        {
          title: 'News 1',
          content: 'Content 1',
          excerpt: 'Excerpt 1',
          category: 'general',
          author: 'Author 1',
          published: true,
        },
        {
          title: 'News 2',
          content: 'Content 2',
          excerpt: 'Excerpt 2',
          category: 'sports',
          author: 'Author 2',
          published: true,
        },
      ]);

      const response = await request(app)
        .get('/api/news')
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.news).toHaveLength(2);
      expect(response.body.data.pagination.total).toBe(2);
    });

    it('should filter news by category', async () => {
      await NewsModel.create([
        {
          title: 'Sports News',
          content: 'Content',
          excerpt: 'Excerpt',
          category: 'sports',
          author: 'Author',
          published: true,
        },
        {
          title: 'General News',
          content: 'Content',
          excerpt: 'Excerpt',
          category: 'general',
          author: 'Author',
          published: true,
        },
      ]);

      const response = await request(app)
        .get('/api/news')
        .query({ category: 'sports' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.news).toHaveLength(1);
      expect(response.body.data.news[0].category).toBe('sports');
    });
  });

  describe('GET /api/news/:id', () => {
    it('should get news article by ID', async () => {
      const news = await NewsModel.create({
        title: 'Test News',
        content: 'Test content',
        excerpt: 'Test excerpt',
        category: 'general',
        author: 'Test Author',
        published: true,
      });

      const response = await request(app)
        .get(`/api/news/${news._id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.news.title).toBe('Test News');
    });

    it('should return 404 for non-existent news', async () => {
      const response = await request(app)
        .get('/api/news/507f1f77bcf86cd799439011')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/news/:id', () => {
    it('should update news article', async () => {
      const news = await NewsModel.create({
        title: 'Original Title',
        content: 'Original content',
        excerpt: 'Original excerpt',
        category: 'general',
        author: 'Test Author',
        published: false,
      });

      const response = await request(app)
        .put(`/api/news/${news._id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'Updated Title',
          published: true,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.news.title).toBe('Updated Title');
      expect(response.body.data.news.published).toBe(true);
    });

    it('should return 401 without authentication', async () => {
      const news = await NewsModel.create({
        title: 'Test News',
        content: 'Test content',
        excerpt: 'Test excerpt',
        category: 'general',
        author: 'Test Author',
      });

      await request(app)
        .put(`/api/news/${news._id}`)
        .send({ title: 'Updated Title' })
        .expect(401);
    });
  });

  describe('DELETE /api/news/:id', () => {
    it('should delete news article', async () => {
      const news = await NewsModel.create({
        title: 'Test News',
        content: 'Test content',
        excerpt: 'Test excerpt',
        category: 'general',
        author: 'Test Author',
      });

      const response = await request(app)
        .delete(`/api/news/${news._id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify news was deleted
      const deletedNews = await NewsModel.findById(news._id);
      expect(deletedNews).toBeNull();
    });

    it('should return 401 without authentication', async () => {
      const news = await NewsModel.create({
        title: 'Test News',
        content: 'Test content',
        excerpt: 'Test excerpt',
        category: 'general',
        author: 'Test Author',
      });

      await request(app)
        .delete(`/api/news/${news._id}`)
        .expect(401);
    });
  });
});
