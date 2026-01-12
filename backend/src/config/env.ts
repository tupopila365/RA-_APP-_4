import dotenv from 'dotenv';

dotenv.config();

interface EnvConfig {
  NODE_ENV: string;
  PORT: number;
  MONGODB_URI: string;
  REDIS_HOST: string;
  REDIS_PORT: number;
  REDIS_PASSWORD?: string;
  PUSH_EXPO_ACCESS_TOKEN?: string;
  PUSH_QUEUE_PREFIX: string;
  PUSH_JOB_ATTEMPTS: number;
  PUSH_JOB_BACKOFF_MS: number;
  PUSH_RECEIPT_DELAY_MS: number;
  JWT_SECRET: string;
  JWT_ACCESS_EXPIRY: string;
  JWT_REFRESH_EXPIRY: string;
  CLOUDINARY_CLOUD_NAME?: string;
  CLOUDINARY_API_KEY?: string;
  CLOUDINARY_API_SECRET?: string;
  CLOUDINARY_PDF_ACCESS_MODE?: 'public' | 'signed';
  CLOUDINARY_SIGNED_URL_EXPIRY?: number;
  GOOGLE_DRIVE_CLIENT_ID?: string;
  GOOGLE_DRIVE_CLIENT_SECRET?: string;
  GOOGLE_DRIVE_REDIRECT_URI?: string;
  GOOGLE_DRIVE_REFRESH_TOKEN?: string;
  GOOGLE_DRIVE_FOLDER_ID?: string;
  GOOGLE_MAPS_API_KEY?: string;
  RAG_SERVICE_URL: string;
  CORS_ORIGIN: string;
  GEOCODING_API_KEY?: string;
  GEOCODING_SERVICE?: 'nominatim' | 'google';
  TRAFFIC_CACHE_TTL_SECONDS?: number;
  TRAFFIC_DIRECTIONS_TIMEOUT_MS?: number;
  SMTP_HOST?: string;
  SMTP_PORT?: number;
  SMTP_USER?: string;
  SMTP_PASSWORD?: string;
  SMTP_FROM_EMAIL?: string;
  SMTP_FROM_NAME?: string;
  EMAIL_VERIFICATION_BASE_URL?: string;
  
  // Security Configuration
  FIELD_ENCRYPTION_KEY: string;
  RECAPTCHA_SECRET_KEY?: string;
  RECAPTCHA_SITE_KEY?: string;
  SECURITY_AUDIT_LOG_LEVEL?: string;
  MAX_LOGIN_ATTEMPTS?: number;
  ACCOUNT_LOCKOUT_DURATION?: number;
  
  // File Security
  ANTIVIRUS_API_KEY?: string;
  ANTIVIRUS_API_URL?: string;
  FILE_QUARANTINE_ENABLED?: boolean;
}

const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = process.env[key] || defaultValue;
  if (!value) {
    throw new Error(`Environment variable ${key} is required but not set`);
  }
  return value;
};

export const env: EnvConfig = {
  NODE_ENV: getEnvVar('NODE_ENV', 'development'),
  PORT: parseInt(getEnvVar('PORT', '5000'), 10),
  MONGODB_URI: process.env.NODE_ENV === 'production' 
    ? getEnvVar('MONGODB_URI') // Use Atlas URI for production
    : 'mongodb://localhost:27017/ra_db', // Always use local MongoDB for development
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
  CLOUDINARY_PDF_ACCESS_MODE: (process.env.CLOUDINARY_PDF_ACCESS_MODE === 'signed' ? 'signed' : 'public') as 'public' | 'signed',
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
  GEOCODING_SERVICE: (process.env.GEOCODING_SERVICE as 'nominatim' | 'google') || 'nominatim',
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
