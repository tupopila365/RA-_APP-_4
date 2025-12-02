"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const winston_1 = __importDefault(require("winston"));
const env_1 = require("../config/env");
/**
 * Safe JSON stringify that handles circular references
 */
const safeStringify = (obj, indent = 2) => {
    const cache = new Set();
    return JSON.stringify(obj, (key, value) => {
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
    }, indent);
};
/**
 * Clean metadata by removing circular references and large objects
 */
const cleanMeta = (meta) => {
    if (!meta || typeof meta !== 'object') {
        return meta;
    }
    const cleaned = {};
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
            }
            catch (error) {
                cleaned[key] = '[Complex Object]';
            }
        }
        else {
            cleaned[key] = value;
        }
    }
    return cleaned;
};
const logFormat = winston_1.default.format.combine(winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston_1.default.format.errors({ stack: true }), winston_1.default.format.splat(), winston_1.default.format.json());
const consoleFormat = winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston_1.default.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    const cleanedMeta = cleanMeta(meta);
    if (Object.keys(cleanedMeta).length > 0) {
        try {
            msg += ` ${safeStringify(cleanedMeta, 0)}`;
        }
        catch (error) {
            msg += ` [Unable to stringify metadata]`;
        }
    }
    return msg;
}));
exports.logger = winston_1.default.createLogger({
    level: env_1.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: logFormat,
    transports: [
        new winston_1.default.transports.Console({
            format: consoleFormat,
        }),
        new winston_1.default.transports.File({
            filename: 'logs/error.log',
            level: 'error',
        }),
        new winston_1.default.transports.File({
            filename: 'logs/combined.log',
        }),
    ],
});
//# sourceMappingURL=logger.js.map