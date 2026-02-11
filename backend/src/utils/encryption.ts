import crypto from 'crypto';
import { env } from '../config/env';

export class FieldEncryption {
  private static readonly ALGORITHM = 'aes-256-gcm';
  private static readonly KEY_LENGTH = 32;
  private static readonly IV_LENGTH = 16;
  private static readonly TAG_LENGTH = 16;

  private static getEncryptionKey(): Buffer {
    const key = env.FIELD_ENCRYPTION_KEY;
    if (!key) {
      throw new Error('FIELD_ENCRYPTION_KEY environment variable is required');
    }
    return crypto.scryptSync(key, 'salt', this.KEY_LENGTH);
  }

  /**
   * Encrypt sensitive field data
   */
  static encrypt(plaintext: string): string {
    if (!plaintext) return '';
    
    const key = this.getEncryptionKey();
    const iv = crypto.randomBytes(this.IV_LENGTH);
    const cipher = crypto.createCipheriv(this.ALGORITHM, key, iv);
    cipher.setAAD(Buffer.from('pln-data'));
    
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();
    
    // Combine IV + tag + encrypted data
    return iv.toString('hex') + tag.toString('hex') + encrypted;
  }

  /**
   * Decrypt sensitive field data
   */
  static decrypt(encryptedData: string): string {
    if (!encryptedData) return '';
    
    const key = this.getEncryptionKey();
    const iv = Buffer.from(encryptedData.slice(0, this.IV_LENGTH * 2), 'hex');
    const tag = Buffer.from(encryptedData.slice(this.IV_LENGTH * 2, (this.IV_LENGTH + this.TAG_LENGTH) * 2), 'hex');
    const encrypted = encryptedData.slice((this.IV_LENGTH + this.TAG_LENGTH) * 2);
    
    const decipher = crypto.createDecipheriv(this.ALGORITHM, key, iv);
    decipher.setAAD(Buffer.from('pln-data'));
    decipher.setAuthTag(tag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  /**
   * Hash data for searching (one-way)
   */
  static hash(data: string): string {
    if (!data) return '';
    return crypto.createHash('sha256').update(data).digest('hex');
  }
}