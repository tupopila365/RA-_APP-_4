"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FieldEncryption = void 0;
const crypto_1 = __importDefault(require("crypto"));
const env_1 = require("../config/env");
class FieldEncryption {
    static getEncryptionKey() {
        const key = env_1.env.FIELD_ENCRYPTION_KEY;
        if (!key) {
            throw new Error('FIELD_ENCRYPTION_KEY environment variable is required');
        }
        return crypto_1.default.scryptSync(key, 'salt', this.KEY_LENGTH);
    }
    /**
     * Encrypt sensitive field data
     */
    static encrypt(plaintext) {
        if (!plaintext)
            return '';
        const key = this.getEncryptionKey();
        const iv = crypto_1.default.randomBytes(this.IV_LENGTH);
        const cipher = crypto_1.default.createCipher(this.ALGORITHM, key);
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
    static decrypt(encryptedData) {
        if (!encryptedData)
            return '';
        const key = this.getEncryptionKey();
        const iv = Buffer.from(encryptedData.slice(0, this.IV_LENGTH * 2), 'hex');
        const tag = Buffer.from(encryptedData.slice(this.IV_LENGTH * 2, (this.IV_LENGTH + this.TAG_LENGTH) * 2), 'hex');
        const encrypted = encryptedData.slice((this.IV_LENGTH + this.TAG_LENGTH) * 2);
        const decipher = crypto_1.default.createDecipher(this.ALGORITHM, key);
        decipher.setAAD(Buffer.from('pln-data'));
        decipher.setAuthTag(tag);
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }
    /**
     * Hash data for searching (one-way)
     */
    static hash(data) {
        if (!data)
            return '';
        return crypto_1.default.createHash('sha256').update(data).digest('hex');
    }
}
exports.FieldEncryption = FieldEncryption;
FieldEncryption.ALGORITHM = 'aes-256-gcm';
FieldEncryption.KEY_LENGTH = 32;
FieldEncryption.IV_LENGTH = 16;
FieldEncryption.TAG_LENGTH = 16;
//# sourceMappingURL=encryption.js.map