import { describe, it, expect, beforeEach } from 'vitest';
import { getNewsList, getNewsById, createNews, updateNews, deleteNews } from '../news.service';
import { setupAuthenticatedUser, clearAuthentication } from '../../test/test-utils';

describe('NewsService', () => {
  beforeEach(() => {
    clearAuthentication();
    setupAuthenticatedUser();
  });

  describe('getNewsList', () => {
    it('should fetch news list successfully', async () => {
      const result = await getNewsList({ page: 1, limit: 10 });

      expect(result.success).toBe(true);
      expect(result.data.news).toBeInstanceOf(Array);
      expect(result.data.news.length).toBeGreaterThan(0);
      expect(result.data.pagination).toBeDefined();
    });

    it('should fetch news with search parameter', async () => {
      const result = await getNewsList({ search: 'test' });

      expect(result.success).toBe(true);
      expect(result.data.news).toBeInstanceOf(Array);
    });

    it('should fetch news with category filter', async () => {
      const result = await getNewsList({ category: 'announcement' });

      expect(result.success).toBe(true);
      expect(result.data.news).toBeInstanceOf(Array);
    });
  });

  describe('getNewsById', () => {
    it('should fetch single news article', async () => {
      const result = await getNewsById('news-1');

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data._id).toBe('news-1');
      expect(result.data.title).toBeDefined();
    });
  });

  describe('createNews', () => {
    it('should create news article successfully', async () => {
      const newsData = {
        title: 'New Article',
        content: 'Article content',
        excerpt: 'Article excerpt',
        category: 'announcement',
        author: 'Admin',
        published: false,
      };

      const result = await createNews(newsData);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.title).toBe(newsData.title);
    });
  });

  describe('updateNews', () => {
    it('should update news article successfully', async () => {
      const updateData = {
        title: 'Updated Title',
        content: 'Updated content',
        excerpt: 'Updated excerpt',
        category: 'announcement',
        author: 'Admin',
        published: true,
      };

      const result = await updateNews('news-1', updateData);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.title).toBe(updateData.title);
    });
  });

  describe('deleteNews', () => {
    it('should delete news article successfully', async () => {
      const result = await deleteNews('news-1');

      expect(result.success).toBe(true);
    });
  });
});
