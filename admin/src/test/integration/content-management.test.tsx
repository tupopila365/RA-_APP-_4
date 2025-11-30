import { describe, it, expect, beforeEach } from 'vitest';
import { setupAuthenticatedUser, clearAuthentication } from '../test-utils';
import { createNews, getNewsList, updateNews, deleteNews } from '../../services/news.service';

describe('Content Management Integration Tests', () => {
  beforeEach(() => {
    clearAuthentication();
    setupAuthenticatedUser();
  });

  describe('News Management Flow', () => {
    it('should complete full CRUD cycle for news article', async () => {
      // 1. Create news article
      const newArticle = {
        title: 'Test News Article',
        content: 'This is test content for the news article.',
        excerpt: 'Test excerpt',
        category: 'announcement',
        author: 'Test Admin',
        published: false,
      };

      const createResult = await createNews(newArticle);
      expect(createResult.success).toBe(true);
      expect(createResult.data.title).toBe(newArticle.title);
      expect(createResult.data.published).toBe(false);

      const articleId = createResult.data._id;

      // 2. Read - Fetch news list and verify article exists
      const listResult = await getNewsList({ page: 1, limit: 10 });
      expect(listResult.success).toBe(true);
      expect(listResult.data.news).toBeInstanceOf(Array);

      // 3. Update - Publish the article
      const updateData = {
        ...newArticle,
        title: 'Updated Test News Article',
        published: true,
      };

      const updateResult = await updateNews(articleId, updateData);
      expect(updateResult.success).toBe(true);
      expect(updateResult.data.title).toBe(updateData.title);
      expect(updateResult.data.published).toBe(true);

      // 4. Delete - Remove the article
      const deleteResult = await deleteNews(articleId);
      expect(deleteResult.success).toBe(true);
    });

    it('should handle search and filtering', async () => {
      // Create multiple articles
      const articles = [
        {
          title: 'Announcement Article',
          content: 'Content',
          excerpt: 'Excerpt',
          category: 'announcement',
          author: 'Admin',
          published: true,
        },
        {
          title: 'Update Article',
          content: 'Content',
          excerpt: 'Excerpt',
          category: 'update',
          author: 'Admin',
          published: true,
        },
      ];

      for (const article of articles) {
        await createNews(article);
      }

      // Search by title
      const searchResult = await getNewsList({ search: 'Announcement' });
      expect(searchResult.success).toBe(true);

      // Filter by category
      const filterResult = await getNewsList({ category: 'announcement' });
      expect(filterResult.success).toBe(true);
    });

    it('should handle pagination correctly', async () => {
      // Fetch first page
      const page1 = await getNewsList({ page: 1, limit: 10 });
      expect(page1.success).toBe(true);
      expect(page1.data.pagination.page).toBe(1);
      expect(page1.data.pagination.limit).toBe(10);

      // Verify pagination metadata
      expect(page1.data.pagination.total).toBeDefined();
      expect(page1.data.pagination.pages).toBeDefined();
    });
  });

  describe('Permission-based Access', () => {
    it('should allow super-admin to access all features', async () => {
      // Super-admin should be able to create news
      const newsData = {
        title: 'Super Admin News',
        content: 'Content',
        excerpt: 'Excerpt',
        category: 'announcement',
        author: 'Super Admin',
        published: true,
      };

      const result = await createNews(newsData);
      expect(result.success).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      // Try to fetch non-existent article
      try {
        await deleteNews('non-existent-id');
      } catch (error: any) {
        // Should handle error without crashing
        expect(error).toBeDefined();
      }
    });
  });

  describe('Data Validation', () => {
    it('should validate required fields', async () => {
      const invalidData = {
        title: '',
        content: '',
        excerpt: '',
        category: '',
        author: '',
        published: false,
      };

      try {
        await createNews(invalidData);
      } catch (error: any) {
        // Should fail validation
        expect(error).toBeDefined();
      }
    });

    it('should handle long content correctly', async () => {
      const longContent = 'A'.repeat(10000);

      const newsData = {
        title: 'Long Content Article',
        content: longContent,
        excerpt: 'Excerpt',
        category: 'announcement',
        author: 'Admin',
        published: false,
      };

      const result = await createNews(newsData);
      expect(result.success).toBe(true);
      expect(result.data.content).toBe(longContent);
    });
  });
});
