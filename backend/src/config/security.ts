import { Application } from 'express';
import cors from 'cors';
import { SecurityHeaders } from '../middlewares/securityHeaders';
import { rateLimiters } from '../middlewares/rateLimiting';

/**
 * Security configuration for the application
 */
export class SecurityConfig {
  /**
   * Apply all security configurations
   */
  static configure(app: Application): void {
    // Apply security headers
    app.use(SecurityHeaders.configureHelmet());
    app.use(SecurityHeaders.applySecurityHeaders);
    app.use('/api', SecurityHeaders.apiSecurityHeaders);
    app.use('/uploads', SecurityHeaders.fileUploadHeaders);

    // Configure CORS
    app.use(cors(SecurityHeaders.configureCORS()));

    // Apply general rate limiting
    app.use('/api', rateLimiters.general);
    app.use('/api/auth', rateLimiters.auth);

    // Disable X-Powered-By header
    app.disable('x-powered-by');

    // Trust proxy (for rate limiting and IP detection)
    app.set('trust proxy', 1);
  }

  /**
   * Security environment validation
   */
  static validateEnvironment(): void {
    const requiredEnvVars = [
      'JWT_SECRET',
      'CLOUDINARY_CLOUD_NAME',
      'CLOUDINARY_API_KEY',
      'CLOUDINARY_API_SECRET',
    ];

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

    if (missingVars.length > 0) {
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }

    // Validate JWT secret strength
    if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
      throw new Error('JWT_SECRET must be at least 32 characters long');
    }

    // Warn about development mode
    if (process.env.NODE_ENV !== 'production') {
      console.warn('⚠️  Application is running in development mode');
    }
  }

  /**
   * Security monitoring setup
   */
  static setupMonitoring(): void {
    // Log security events
    process.on('uncaughtException', (error) => {
      console.error('Uncaught Exception:', error);
      // In production, you might want to send this to a monitoring service
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
      // In production, you might want to send this to a monitoring service
    });
  }
}