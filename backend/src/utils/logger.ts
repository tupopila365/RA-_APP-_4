import winston from 'winston';
import { env } from '../config/env';

/**
 * Safe JSON stringify that handles circular references
 */
const safeStringify = (obj: any, indent = 2): string => {
  const cache = new Set();
  return JSON.stringify(
    obj,
    (key, value) => {
      // Skip circular references
      if (typeof value === 'object' && value !== null) {
        if (cache.has(value)) {
          return '[Circular]';
        }
        cache.add(value);
      }
      // Remove problematic fields that cause circular references
      if (key === 'socket' || key === '_httpMessage' || key === 'client' || key === 'connection') {
        return '[Removed]';
      }
      return value;
    },
    indent
  );
};

/**
 * Clean metadata by removing circular references and large objects
 */
const cleanMeta = (meta: any): any => {
  if (!meta || typeof meta !== 'object') {
    return meta;
  }

  const cleaned: any = {};
  
  for (const [key, value] of Object.entries(meta)) {
    // Skip Winston's internal fields
    if (key === 'timestamp' || key === 'level' || key === 'message' || key === 'splat') {
      continue;
    }

    // Handle error objects specially
    if (value instanceof Error) {
      cleaned[key] = {
        name: value.name,
        message: value.message,
        stack: value.stack,
      };
      continue;
    }

    // Skip functions
    if (typeof value === 'function') {
      continue;
    }

    // Handle objects that might have circular references
    if (typeof value === 'object' && value !== null) {
      // For request/response objects, extract only useful info
      if (value.constructor?.name === 'IncomingMessage' || value.constructor?.name === 'ClientRequest') {
        cleaned[key] = {
          method: value.method,
          url: value.url,
          statusCode: value.statusCode,
          headers: value.headers,
        };
        continue;
      }

      // For other objects, try to stringify safely
      try {
        cleaned[key] = JSON.parse(safeStringify(value));
      } catch (error) {
        cleaned[key] = '[Complex Object]';
      }
    } else {
      cleaned[key] = value;
    }
  }

  return cleaned;
};

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    
    const cleanedMeta = cleanMeta(meta);
    
    if (Object.keys(cleanedMeta).length > 0) {
      try {
        msg += ` ${safeStringify(cleanedMeta, 0)}`;
      } catch (error) {
        msg += ` [Unable to stringify metadata]`;
      }
    }
    
    return msg;
  })
);

export const logger = winston.createLogger({
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: logFormat,
  transports: [
    new winston.transports.Console({
      format: consoleFormat,
    }),
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
    }),
  ],
});
