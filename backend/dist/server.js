"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const db_1 = require("./config/db");
const redis_1 = require("./config/redis");
const cloudinary_1 = require("./config/cloudinary");
const env_1 = require("./config/env");
const logger_1 = require("./utils/logger");
const os_1 = require("os");
// Get local network IP address
const getNetworkIP = () => {
    const nets = (0, os_1.networkInterfaces)();
    for (const name of Object.keys(nets)) {
        const netInfo = nets[name];
        if (!netInfo)
            continue;
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
    let server = null;
    try {
        // Connect to MongoDB
        await (0, db_1.connectDB)();
        logger_1.logger.info('MongoDB connected successfully');
        // Connect to Redis (optional)
        const redisClient = await (0, redis_1.connectRedis)();
        if (redisClient) {
            logger_1.logger.info('Redis connected successfully');
        }
        // Configure Cloudinary
        (0, cloudinary_1.configureCloudinary)();
        // Create Express app
        const app = (0, app_1.createApp)();
        // Start server - listen on all network interfaces (0.0.0.0) to allow external connections
        server = app.listen(env_1.env.PORT, '0.0.0.0', () => {
            const networkIP = getNetworkIP();
            logger_1.logger.info(`✅ Server running on port ${env_1.env.PORT} in ${env_1.env.NODE_ENV} mode`);
            logger_1.logger.info(`📍 Local:   http://localhost:${env_1.env.PORT}`);
            if (networkIP) {
                logger_1.logger.info(`📍 Network: http://${networkIP}:${env_1.env.PORT}`);
                logger_1.logger.info(`📱 Use this URL for mobile: http://${networkIP}:${env_1.env.PORT}/api`);
            }
            else {
                logger_1.logger.warn('⚠️  Could not detect network IP address');
            }
        });
        // Graceful shutdown
        const gracefulShutdown = async (signal) => {
            logger_1.logger.info(`${signal} received. Starting graceful shutdown...`);
            // Close HTTP server if it exists
            if (server && typeof server.close === 'function') {
                server.close(async () => {
                    logger_1.logger.info('HTTP server closed');
                    try {
                        // Close database connections
                        const mongoose = await Promise.resolve().then(() => __importStar(require('mongoose')));
                        if (mongoose.connection.readyState !== 0) {
                            await mongoose.connection.close();
                            logger_1.logger.info('MongoDB connection closed');
                        }
                        const { getRedisClient } = await Promise.resolve().then(() => __importStar(require('./config/redis')));
                        const redisClient = getRedisClient();
                        if (redisClient && redisClient.isOpen) {
                            await redisClient.quit();
                            logger_1.logger.info('Redis connection closed');
                        }
                        process.exit(0);
                    }
                    catch (error) {
                        logger_1.logger.error('Error during graceful shutdown:', error);
                        process.exit(1);
                    }
                });
                // Force shutdown after 10 seconds
                setTimeout(() => {
                    logger_1.logger.error('Forced shutdown after timeout');
                    process.exit(1);
                }, 10000);
            }
            else {
                // Server not initialized, just close connections
                logger_1.logger.warn('Server not initialized, closing connections directly');
                try {
                    const mongoose = await Promise.resolve().then(() => __importStar(require('mongoose')));
                    if (mongoose.connection.readyState !== 0) {
                        await mongoose.connection.close();
                        logger_1.logger.info('MongoDB connection closed');
                    }
                    process.exit(0);
                }
                catch (error) {
                    logger_1.logger.error('Error closing connections:', error);
                    process.exit(1);
                }
            }
        };
        // Handle shutdown signals
        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));
        // Handle uncaught exceptions
        process.on('uncaughtException', (error) => {
            logger_1.logger.error('Uncaught Exception:', error);
            gracefulShutdown('uncaughtException');
        });
        // Handle unhandled promise rejections
        process.on('unhandledRejection', (reason, promise) => {
            logger_1.logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
            // Don't crash on unhandled rejections, just log them
            // gracefulShutdown('unhandledRejection');
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to start server:', error);
        process.exit(1);
    }
};
// Start the server
startServer();
//# sourceMappingURL=server.js.map