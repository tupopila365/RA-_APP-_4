import crypto from 'crypto';
import { customAlphabet } from 'nanoid';

/**
 * Secure ID generation utilities
 */
export class SecureIdGenerator {
  /**
   * Generate cryptographically secure PLN reference ID
   * Format: PLN-{YYYY}-{SecureRandom12}
   */
  static generatePLNReferenceId(): string {
    const year = new Date().getFullYear();
    
    // Generate 12-character secure random string
    // Using custom alphabet to avoid confusion (no 0, O, I, l)
    const alphabet = '123456789ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz';
    const nanoid = customAlphabet(alphabet, 12);
    const secureRandom = nanoid();
    
    return `PLN-${year}-${secureRandom}`;
  }

  /**
   * Generate cryptographically secure Vehicle Registration reference ID
   * Format: VREG-{YYYY}-{SecureRandom12}
   */
  static generateVehicleRegReferenceId(): string {
    const year = new Date().getFullYear();
    
    // Generate 12-character secure random string
    // Using custom alphabet to avoid confusion (no 0, O, I, l)
    const alphabet = '123456789ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz';
    const nanoid = customAlphabet(alphabet, 12);
    const secureRandom = nanoid();
    
    return `VREG-${year}-${secureRandom}`;
  }

  /**
   * Generate secure tracking token (for additional security layer)
   */
  static generateTrackingToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Generate secure file upload token
   */
  static generateFileUploadToken(): string {
    return crypto.randomBytes(16).toString('hex');
  }

  /**
   * Generate CSRF token
   */
  static generateCSRFToken(): string {
    return crypto.randomBytes(32).toString('base64url');
  }

  /**
   * Generate secure session ID
   */
  static generateSessionId(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Hash sensitive data for storage
   */
  static hashSensitiveData(data: string, salt?: string): { hash: string; salt: string } {
    const useSalt = salt || crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(data, useSalt, 10000, 64, 'sha512').toString('hex');
    
    return { hash, salt: useSalt };
  }

  /**
   * Verify hashed data
   */
  static verifyHashedData(data: string, hash: string, salt: string): boolean {
    const verifyHash = crypto.pbkdf2Sync(data, salt, 10000, 64, 'sha512').toString('hex');
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(verifyHash, 'hex'));
  }

  /**
   * Generate secure API key
   */
  static generateAPIKey(): string {
    const prefix = 'pln_';
    const key = crypto.randomBytes(32).toString('hex');
    return `${prefix}${key}`;
  }

  /**
   * Validate reference ID format
   */
  static validateReferenceId(referenceId: string): boolean {
    // PLN-YYYY-{12 character secure string}
    const pattern = /^PLN-\d{4}-[123456789ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz]{12}$/;
    return pattern.test(referenceId);
  }

  /**
   * Generate one-time verification code
   */
  static generateVerificationCode(): string {
    // 6-digit numeric code
    return crypto.randomInt(100000, 999999).toString();
  }

  /**
   * Generate secure temporary password
   */
  static generateTemporaryPassword(): string {
    const alphabet = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz123456789!@#$%^&*';
    const nanoid = customAlphabet(alphabet, 16);
    return nanoid();
  }
}