export declare class FieldEncryption {
    private static readonly ALGORITHM;
    private static readonly KEY_LENGTH;
    private static readonly IV_LENGTH;
    private static readonly TAG_LENGTH;
    private static getEncryptionKey;
    /**
     * Encrypt sensitive field data
     */
    static encrypt(plaintext: string): string;
    /**
     * Decrypt sensitive field data
     */
    static decrypt(encryptedData: string): string;
    /**
     * Hash data for searching (one-way)
     */
    static hash(data: string): string;
}
//# sourceMappingURL=encryption.d.ts.map