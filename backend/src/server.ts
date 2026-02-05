import 'dotenv/config';
import 'reflect-metadata';
import { createApp } from './app';
import { connectDB, disconnectDB } from './config/db';
import { connectRedis } from './config/redis';
import { env } from './config/env';
import { logger } from './utils/logger';
import { networkInterfaces } from 'os';

// Get local network IP address
const getNetworkIP = (): string | null => {
  const nets = networkInterfaces();
  for (const name of Object.keys(nets)) {
    const netInfo = nets[name];
    if (!netInfo) continue;
    
    for (const net of netInfo) {
      // Skip internal (loopback) and non-IPv4 addresses
      // Look for IPv4 addresses that are not internal
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return null;
};

const startServer = async () => {
  let server: any = null;
  
  try {
    // Connect to SQL Server
    await connectDB();
    logger.info('SQL Server connected successfully');

    // Connect to Redis (optional)
    const redisClient = await connectRedis();
    if (redisClient) {
      logger.info('Redis connected successfully');
    }

    // Create Express app
    const app = createApp();

    // Start server - listen on all network interfaces (0.0.0.0) to allow external connections
    server = app.listen(env.PORT, '0.0.0.0', () => {
      const networkIP = getNetworkIP();
      
      logger.info(`✅ Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
      logger.info(`📍 Local:   http://localhost:${env.PORT}`);
      
      if (networkIP) {
        logger.info(`📍 Network: http://${networkIP}:${env.PORT}`);
        logger.info(`📱 Use this URL for mobile: http://${networkIP}:${env.PORT}/api`);
      } else {
        logger.warn('⚠️  Could not detect network IP address');
      }
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      logger.info(`${signal} received. Starting graceful shutdown...`);
      
      // Close HTTP server if it exists
      if (server && typeof server.close === 'function') {
        server.close(async () => {
          logger.info('HTTP server closed');
          
          try {
            // Close database connections
            await disconnectDB();
            
            // Close Redis connection safely
            try {
              const { getRedisClient } = await import('./config/redis');
              const redisClient = getRedisClient();
              if (redisClient && redisClient.isOpen) {
                await redisClient.quit();
                logger.info('Redis connection closed');
              }
            } catch (redisError) {
              logger.warn('Redis connection already closed or not available');
            }
            
            process.exit(0);
          } catch (error) {
            logger.error('Error during graceful shutdown:', error);
            process.exit(1);
          }
        });

        // Force shutdown after 10 seconds
        setTimeout(() => {
          logger.error('Forced shutdown after timeout');
          process.exit(1);
        }, 10000);
      } else {
        // Server not initialized, just close connections
        logger.warn('Server not initialized, closing connections directly');
        try {
          await disconnectDB();
          process.exit(0);
        } catch (error) {
          logger.error('Error closing connections:', error);
          process.exit(1);
        }
      }
    };

    // Handle shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
      gracefulShutdown('uncaughtException');
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
      // Don't crash on unhandled rejections, just log them
      // gracefulShutdown('unhandledRejection');
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();
