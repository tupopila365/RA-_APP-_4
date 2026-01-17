/**
 * Notifications Service
 * Handles fetching user notifications from the backend
 */

import { ApiClient, ApiError } from './api';
import { API_ENDPOINTS } from './api';

// Mock notifications data for testing
const MOCK_NOTIFICATIONS = [
  {
    id: '1',
    title: 'New News Article Published',
    body: 'Roads Authority announces major infrastructure improvements for Windhoek region',
    type: 'news',
    relatedId: 'news-123',
    data: {
      type: 'news',
      newsId: 'news-123',
      screen: 'NewsDetail',
    },
    sentAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    title: 'New Tender Available',
    body: 'Tender for Road Maintenance Services - Closes: Jan 15, 2025',
    type: 'tender',
    relatedId: 'tender-456',
    data: {
      type: 'tender',
      tenderId: 'tender-456',
      screen: 'Tenders',
    },
    sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    title: 'New Job Vacancy',
    body: 'Senior Civil Engineer Position Available - Closes: Jan 20, 2025',
    type: 'vacancy',
    relatedId: 'vacancy-789',
    data: {
      type: 'vacancy',
      vacancyId: 'vacancy-789',
      screen: 'Vacancies',
    },
    sentAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // Yesterday
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    title: 'System Maintenance Notice',
    body: 'Scheduled maintenance will occur on January 10, 2025 from 2:00 AM to 4:00 AM',
    type: 'general',
    data: {
      type: 'general',
      screen: 'Home',
    },
    sentAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '5',
    title: 'New News Article Published',
    body: 'Update on B1 Highway expansion project progress',
    type: 'news',
    relatedId: 'news-124',
    data: {
      type: 'news',
      newsId: 'news-124',
      screen: 'NewsDetail',
    },
    sentAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '6',
    title: 'New Tender Available',
    body: 'Tender for Bridge Construction Project - Closes: Jan 25, 2025',
    type: 'tender',
    relatedId: 'tender-457',
    data: {
      type: 'tender',
      tenderId: 'tender-457',
      screen: 'Tenders',
    },
    sentAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week ago
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '7',
    title: 'New Job Vacancy',
    body: 'Project Manager Position Available - Closes: Jan 30, 2025',
    type: 'vacancy',
    relatedId: 'vacancy-790',
    data: {
      type: 'vacancy',
      vacancyId: 'vacancy-790',
      screen: 'Vacancies',
    },
    sentAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '8',
    title: 'Important Announcement',
    body: 'Road closure on Independence Avenue from Jan 12-15 for maintenance work',
    type: 'general',
    data: {
      type: 'general',
      screen: 'Home',
    },
    sentAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(), // 12 days ago
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '9',
    title: 'New News Article Published',
    body: 'Roads Authority launches new mobile app for citizen reporting',
    type: 'news',
    relatedId: 'news-125',
    data: {
      type: 'news',
      newsId: 'news-125',
      screen: 'NewsDetail',
    },
    sentAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 2 weeks ago
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '10',
    title: 'New Tender Available',
    body: 'Tender for Traffic Signage Installation - Closes: Feb 1, 2025',
    type: 'tender',
    relatedId: 'tender-458',
    data: {
      type: 'tender',
      tenderId: 'tender-458',
      screen: 'Tenders',
    },
    sentAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

class NotificationsService {
  /**
   * Get mock notifications for testing
   * @param {number} page - Page number (default: 1)
   * @param {number} limit - Items per page (default: 20)
   * @returns {Promise<{notifications: Array, total: number, page: number, totalPages: number}>}
   */
  getMockNotifications(page = 1, limit = 20) {
    return new Promise((resolve) => {
      // Simulate network delay
      setTimeout(() => {
        const skip = (page - 1) * limit;
        const paginatedNotifications = MOCK_NOTIFICATIONS.slice(skip, skip + limit);
        const total = MOCK_NOTIFICATIONS.length;
        const totalPages = Math.ceil(total / limit);

        resolve({
          notifications: paginatedNotifications,
          total,
          page,
          totalPages,
        });
      }, 500); // 500ms delay to simulate API call
    });
  }

  /**
   * Get user notifications
   * @param {number} page - Page number (default: 1)
   * @param {number} limit - Items per page (default: 20)
   * @param {boolean} useMock - Use mock data instead of API (default: true for now)
   * @returns {Promise<{notifications: Array, total: number, page: number, totalPages: number}>}
   */
  async getUserNotifications(page = 1, limit = 20, useMock = true) {
    // Use mock data by default for testing
    if (useMock) {
      console.log('📱 Using mock notifications data');
      return this.getMockNotifications(page, limit);
    }

    try {
      const response = await ApiClient.get(
        `${API_ENDPOINTS.NOTIFICATIONS_USER}?page=${page}&limit=${limit}`
      );

      if (response.success && response.data) {
        return response.data;
      }

      throw new ApiError('Failed to fetch notifications', 500, response);
    } catch (error) {
      console.error('Error fetching user notifications:', error);
      console.log('📱 Falling back to mock notifications data');
      // Fallback to mock data on error
      return this.getMockNotifications(page, limit);
    }
  }
}

export const notificationsService = new NotificationsService();
















