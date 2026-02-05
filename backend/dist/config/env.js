"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
/** Parse env string to boolean. Treats "true", "1", "yes" (case-insensitive) as true. */
const parseBooleanEnv = (value) => {
    if (value === undefined || value === '')
        return false;
    const v = String(value).toLowerCase().trim();
    return v === 'true' || v === '1' || v === 'yes';
};
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
    DB_HOST: process.env.DB_HOST || 'localhost',
    DB_PORT: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 1433,
    DB_NAME: process.env.DB_NAME || 'ra_db',
    DB_USER: process.env.DB_USER || 'sa',
    DB_PASSWORD: process.env.DB_PASSWORD || '',
    DB_TRUST_SERVER_CERTIFICATE: process.env.DB_TRUST_SERVER_CERTIFICATE === 'false' ? false : true,
    DB_TRUSTED_CONNECTION: parseBooleanEnv(process.env.DB_TRUSTED_CONNECTION),
    REDIS_HOST: process.env.REDIS_HOST || '',
    REDIS_PORT: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : 0,
    REDIS_PASSWORD: process.env.REDIS_PASSWORD,
    PUSH_EXPO_ACCESS_TOKEN: process.env.PUSH_EXPO_ACCESS_TOKEN,
    PUSH_QUEUE_PREFIX: process.env.PUSH_QUEUE_PREFIX || 'push',
    PUSH_JOB_ATTEMPTS: process.env.PUSH_JOB_ATTEMPTS ? parseInt(process.env.PUSH_JOB_ATTEMPTS, 10) : 3,
    PUSH_JOB_BACKOFF_MS: process.env.PUSH_JOB_BACKOFF_MS ? parseInt(process.env.PUSH_JOB_BACKOFF_MS, 10) : 2000,
    PUSH_RECEIPT_DELAY_MS: process.env.PUSH_RECEIPT_DELAY_MS ? parseInt(process.env.PUSH_RECEIPT_DELAY_MS, 10) : 15 * 60 * 1000,
    JWT_SECRET: getEnvVar('JWT_SECRET'),
    JWT_ACCESS_EXPIRY: getEnvVar('JWT_ACCESS_EXPIRY', '15m'),
    JWT_REFRESH_EXPIRY: getEnvVar('JWT_REFRESH_EXPIRY', '7d'),
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
    CLOUDINARY_PDF_ACCESS_MODE: (process.env.CLOUDINARY_PDF_ACCESS_MODE === 'signed' ? 'signed' : 'public'),
    CLOUDINARY_SIGNED_URL_EXPIRY: process.env.CLOUDINARY_SIGNED_URL_EXPIRY
        ? parseInt(process.env.CLOUDINARY_SIGNED_URL_EXPIRY, 10)
        : 86400, // Default to 24 hours (86400 seconds)
    GOOGLE_DRIVE_CLIENT_ID: process.env.GOOGLE_DRIVE_CLIENT_ID,
    GOOGLE_DRIVE_CLIENT_SECRET: process.env.GOOGLE_DRIVE_CLIENT_SECRET,
    GOOGLE_DRIVE_REDIRECT_URI: process.env.GOOGLE_DRIVE_REDIRECT_URI,
    GOOGLE_DRIVE_REFRESH_TOKEN: process.env.GOOGLE_DRIVE_REFRESH_TOKEN,
    GOOGLE_DRIVE_FOLDER_ID: process.env.GOOGLE_DRIVE_FOLDER_ID,
    GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY || process.env.GEOCODING_API_KEY,
    RAG_SERVICE_URL: getEnvVar('RAG_SERVICE_URL', 'http://localhost:8001'),
    CORS_ORIGIN: getEnvVar('CORS_ORIGIN', 'http://localhost:3000'),
    GEOCODING_API_KEY: process.env.GEOCODING_API_KEY,
    GEOCODING_SERVICE: process.env.GEOCODING_SERVICE || 'nominatim',
    TRAFFIC_CACHE_TTL_SECONDS: process.env.TRAFFIC_CACHE_TTL_SECONDS
        ? parseInt(process.env.TRAFFIC_CACHE_TTL_SECONDS, 10)
        : 180,
    TRAFFIC_DIRECTIONS_TIMEOUT_MS: process.env.TRAFFIC_DIRECTIONS_TIMEOUT_MS
        ? parseInt(process.env.TRAFFIC_DIRECTIONS_TIMEOUT_MS, 10)
        : 8000,
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASSWORD: process.env.SMTP_PASSWORD,
    SMTP_FROM_EMAIL: process.env.SMTP_FROM_EMAIL || 'noreply@roadsauthority.na',
    SMTP_FROM_NAME: process.env.SMTP_FROM_NAME || 'Roads Authority Namibia',
    EMAIL_VERIFICATION_BASE_URL: process.env.EMAIL_VERIFICATION_BASE_URL || 'roadsauthority://verify-email',
    // Security Configuration
    FIELD_ENCRYPTION_KEY: getEnvVar('FIELD_ENCRYPTION_KEY'),
    RECAPTCHA_SECRET_KEY: process.env.RECAPTCHA_SECRET_KEY,
    RECAPTCHA_SITE_KEY: process.env.RECAPTCHA_SITE_KEY,
    SECURITY_AUDIT_LOG_LEVEL: process.env.SECURITY_AUDIT_LOG_LEVEL,
    MAX_LOGIN_ATTEMPTS: process.env.MAX_LOGIN_ATTEMPTS ? parseInt(process.env.MAX_LOGIN_ATTEMPTS, 10) : undefined,
    ACCOUNT_LOCKOUT_DURATION: process.env.ACCOUNT_LOCKOUT_DURATION ? parseInt(process.env.ACCOUNT_LOCKOUT_DURATION, 10) : undefined,
    // File Security
    ANTIVIRUS_API_KEY: process.env.ANTIVIRUS_API_KEY,
    ANTIVIRUS_API_URL: process.env.ANTIVIRUS_API_URL,
    FILE_QUARANTINE_ENABLED: process.env.FILE_QUARANTINE_ENABLED === 'true',
};
//# sourceMappingURL=env.js.map