"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const getEnvVar = (key, defaultValue) => {
    const value = process.env[key] || defaultValue;
    if (!value) {
        throw new Error(`Environment variable ${key} is required but not set`);
    }
    return value;
};
exports.env = {
    NODE_ENV: getEnvVar('NODE_ENV', 'development'),
    PORT: parseInt(getEnvVar('PORT', '5000'), 10),
    MONGODB_URI: getEnvVar('MONGODB_URI'),
    REDIS_HOST: process.env.REDIS_HOST || '',
    REDIS_PORT: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : 0,
    REDIS_PASSWORD: process.env.REDIS_PASSWORD,
    JWT_SECRET: getEnvVar('JWT_SECRET'),
    JWT_ACCESS_EXPIRY: getEnvVar('JWT_ACCESS_EXPIRY', '15m'),
    JWT_REFRESH_EXPIRY: getEnvVar('JWT_REFRESH_EXPIRY', '7d'),
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
    RAG_SERVICE_URL: getEnvVar('RAG_SERVICE_URL', 'http://localhost:8000'),
    CORS_ORIGIN: getEnvVar('CORS_ORIGIN', 'http://localhost:3000'),
};
//# sourceMappingURL=env.js.map