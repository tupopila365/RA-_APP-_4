"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecureIdGenerator = void 0;
const crypto_1 = __importDefault(require("crypto"));
const nanoid_1 = require("nanoid");
/**
 * Secure ID generation utilities
 */
class SecureIdGenerator {
    /**
     * Generate cryptographically secure PLN reference ID
     * Format: PLN-{YYYY}-{SecureRandom12}
     */
    static generatePLNReferenceId() {
        const year = new Date().getFullYear();
        // Generate 12-character secure random string
        // Using custom alphabet to avoid confusion (no 0, O, I, l)
        const alphabet = '123456789ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz';
        const nanoid = (0, nanoid_1.customAlphabet)(alphabet, 12);
        const secureRandom = nanoid();
        return `PLN-${year}-${secureRandom}`;
    }
    /**
     * Generate cryptographically secure Vehicle Registration reference ID
     * Format: VREG-{YYYY}-{SecureRandom12}
     */
    static generateVehicleRegReferenceId() {
        const year = new Date().getFullYear();
        // Generate 12-character secure random string
        // Using custom alphabet to avoid confusion (no 0, O, I, l)
        const alphabet = '123456789ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz';
        const nanoid = (0, nanoid_1.customAlphabet)(alphabet, 12);
        const secureRandom = nanoid();
        return `VREG-${year}-${secureRandom}`;
    }
    /**
     * Generate secure tracking token (for additional security layer)
     */
    static generateTrackingToken() {
        return crypto_1.default.randomBytes(32).toString('hex');
    }
    /**
     * Generate secure file upload token
     */
    static generateFileUploadToken() {
        return crypto_1.default.randomBytes(16).toString('hex');
    }
    /**
     * Generate CSRF token
     */
    static generateCSRFToken() {
        return crypto_1.default.randomBytes(32).toString('base64url');
    }
    /**
     * Generate secure session ID
     */
    static generateSessionId() {
        return crypto_1.default.randomBytes(32).toString('hex');
    }
    /**
     * Hash sensitive data for storage
     */
    static hashSensitiveData(data, salt) {
        const useSalt = salt || crypto_1.default.randomBytes(16).toString('hex');
        const hash = crypto_1.default.pbkdf2Sync(data, useSalt, 10000, 64, 'sha512').toString('hex');
        return { hash, salt: useSalt };
    }
    /**
     * Verify hashed data
     */
    static verifyHashedData(data, hash, salt) {
        const verifyHash = crypto_1.default.pbkdf2Sync(data, salt, 10000, 64, 'sha512').toString('hex');
        return crypto_1.default.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(verifyHash, 'hex'));
    }
    /**
     * Generate secure API key
     */
    static generateAPIKey() {
        const prefix = 'pln_';
        const key = crypto_1.default.randomBytes(32).toString('hex');
        return `${prefix}${key}`;
    }
    /**
     * Validate reference ID format
     */
    static validateReferenceId(referenceId) {
        // PLN-YYYY-{12 character secure string}
        const pattern = /^PLN-\d{4}-[123456789ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz]{12}$/;
        return pattern.test(referenceId);
    }
    /**
     * Generate one-time verification code
     */
    static generateVerificationCode() {
        // 6-digit numeric code
        return crypto_1.default.randomInt(100000, 999999).toString();
    }
    /**
     * Generate secure temporary password
     */
    static generateTemporaryPassword() {
        const alphabet = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz123456789!@#$%^&*';
        const nanoid = (0, nanoid_1.customAlphabet)(alphabet, 16);
        return nanoid();
    }
}
exports.SecureIdGenerator = SecureIdGenerator;
//# sourceMappingURL=secureIdGenerator.js.map