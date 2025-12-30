import express, { Application } from 'express';
import cors from 'cors';
import { env } from './config/env';
import { errorHandler } from './middlewares/errorHandler';
import authRoutes from './modules/auth/auth.routes';
import usersRoutes from './modules/auth/users.routes';
import documentsRoutes from './modules/documents/documents.routes';
import newsRoutes from './modules/news/news.routes';
import vacanciesRoutes from './modules/vacancies/vacancies.routes';
import tendersRoutes from './modules/tenders/tenders.routes';
import bannersRoutes from './modules/banners/banners.routes';
import locationsRoutes from './modules/locations/locations.routes';
import chatbotRoutes from './modules/chatbot/chatbot.routes';
import uploadRoutes from './modules/upload/upload.routes';
import faqsRoutes from './modules/faqs/faqs.routes';
import potholeReportsRoutes from './modules/pothole-reports/pothole-reports.routes';
import notificationsRoutes from './modules/notifications/notifications.routes';
import plnRoutes from './modules/pln/pln.routes';
import appUsersRoutes from './modules/app-users/app-users.routes';

export const createApp = (): Application => {
  const app = express();

  // Middleware
  app.use(cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check endpoint
  app.get('/health', (_req, res) => {
    res.status(200).json({
      success: true,
      message: 'Server is running',
      timestamp: new Date().toISOString(),
    });
  });

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/users', usersRoutes);
  app.use('/api/documents', documentsRoutes);
  app.use('/api/news', newsRoutes);
  app.use('/api/vacancies', vacanciesRoutes);
  app.use('/api/tenders', tendersRoutes);
  app.use('/api/banners', bannersRoutes);
  app.use('/api/locations', locationsRoutes);
  app.use('/api/chatbot', chatbotRoutes);
  app.use('/api/upload', uploadRoutes);
  app.use('/api/faqs', faqsRoutes);
  app.use('/api/pothole-reports', potholeReportsRoutes);
  app.use('/api/notifications', notificationsRoutes);
  app.use('/api/pln', plnRoutes);
  app.use('/api/app-users', appUsersRoutes);

  // Error handling middleware (must be last)
  app.use(errorHandler);

  return app;
};

// Export app instance for testing
export const app = createApp();
