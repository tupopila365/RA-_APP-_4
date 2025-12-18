import dotenv from 'dotenv';

dotenv.config();

interface EnvConfig {
  NODE_ENV: string;
  PORT: number;
  MONGODB_URI: string;
  REDIS_HOST: string;
  REDIS_PORT: number;
  REDIS_PASSWORD?: string;
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
  RAG_SERVICE_URL: string;
  CORS_ORIGIN: string;
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
  RAG_SERVICE_URL: getEnvVar('RAG_SERVICE_URL', 'http://localhost:8000'),
  CORS_ORIGIN: getEnvVar('CORS_ORIGIN', 'http://localhost:3000'),
};
