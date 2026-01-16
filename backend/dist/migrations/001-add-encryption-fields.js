"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddEncryptionFieldsMigration = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const pln_model_1 = require("../modules/pln/pln.model");
const encryption_1 = require("../utils/encryption");
const logger_1 = require("../utils/logger");
/**
 * Migration to add encrypted fields to existing PLN records
 */
class AddEncryptionFieldsMigration {
    static async up() {
        logger_1.logger.info('Starting encryption fields migration...');
        try {
            // Get all PLN records that don't have encrypted fields
            const records = await pln_model_1.PLNModel.find({
                $or: [
                    { surname_encrypted: { $exists: false } },
                    { initials_encrypted: { $exists: false } },
                ]
            });
            logger_1.logger.info(`Found ${records.length} records to migrate`);
            let migrated = 0;
            let errors = 0;
            for (const record of records) {
                try {
                    const updates = {};
                    // Encrypt text fields
                    if (record.surname && !record.surname_encrypted) {
                        updates.surname_encrypted = encryption_1.FieldEncryption.encrypt(record.surname);
                        updates.surname_hash = encryption_1.FieldEncryption.hash(record.surname.toLowerCase());
                    }
                    if (record.initials && !record.initials_encrypted) {
                        updates.initials_encrypted = encryption_1.FieldEncryption.encrypt(record.initials);
                    }
                    if (record.businessName && !record.businessName_encrypted) {
                        updates.businessName_encrypted = encryption_1.FieldEncryption.encrypt(record.businessName);
                    }
                    if (record.email && !record.email_encrypted) {
                        updates.email_encrypted = encryption_1.FieldEncryption.encrypt(record.email);
                        updates.email_hash = encryption_1.FieldEncryption.hash(record.email.toLowerCase());
                    }
                    // Encrypt ID numbers
                    if (record.trafficRegisterNumber && !record.trafficRegisterNumber_encrypted) {
                        updates.trafficRegisterNumber_encrypted = encryption_1.FieldEncryption.encrypt(record.trafficRegisterNumber);
                        updates.trafficRegisterNumber_hash = encryption_1.FieldEncryption.hash(record.trafficRegisterNumber);
                    }
                    if (record.businessRegNumber && !record.businessRegNumber_encrypted) {
                        updates.businessRegNumber_encrypted = encryption_1.FieldEncryption.encrypt(record.businessRegNumber);
                        updates.businessRegNumber_hash = encryption_1.FieldEncryption.hash(record.businessRegNumber);
                    }
                    // Encrypt legacy fields
                    if (record.fullName && !record.fullName_encrypted) {
                        updates.fullName_encrypted = encryption_1.FieldEncryption.encrypt(record.fullName);
                        updates.fullName_hash = encryption_1.FieldEncryption.hash(record.fullName.toLowerCase());
                    }
                    if (record.idNumber && !record.idNumber_encrypted) {
                        updates.idNumber_encrypted = encryption_1.FieldEncryption.encrypt(record.idNumber);
                        updates.idNumber_hash = encryption_1.FieldEncryption.hash(record.idNumber);
                    }
                    if (record.phoneNumber && !record.phoneNumber_encrypted) {
                        updates.phoneNumber_encrypted = encryption_1.FieldEncryption.encrypt(record.phoneNumber);
                    }
                    // Update record
                    if (Object.keys(updates).length > 0) {
                        await pln_model_1.PLNModel.updateOne({ _id: record._id }, updates);
                        migrated++;
                    }
                    if (migrated % 100 === 0) {
                        logger_1.logger.info(`Migrated ${migrated} records...`);
                    }
                }
                catch (error) {
                    logger_1.logger.error(`Failed to migrate record ${record._id}:`, error);
                    errors++;
                }
            }
            logger_1.logger.info(`Migration completed: ${migrated} migrated, ${errors} errors`);
        }
        catch (error) {
            logger_1.logger.error('Migration failed:', error);
            throw error;
        }
    }
    static async down() {
        logger_1.logger.info('Rolling back encryption fields migration...');
        try {
            // Remove encrypted fields
            await pln_model_1.PLNModel.updateMany({}, {
                $unset: {
                    surname_encrypted: 1,
                    surname_hash: 1,
                    initials_encrypted: 1,
                    businessName_encrypted: 1,
                    email_encrypted: 1,
                    email_hash: 1,
                    trafficRegisterNumber_encrypted: 1,
                    trafficRegisterNumber_hash: 1,
                    businessRegNumber_encrypted: 1,
                    businessRegNumber_hash: 1,
                    fullName_encrypted: 1,
                    fullName_hash: 1,
                    idNumber_encrypted: 1,
                    idNumber_hash: 1,
                    phoneNumber_encrypted: 1,
                }
            });
            logger_1.logger.info('Rollback completed');
        }
        catch (error) {
            logger_1.logger.error('Rollback failed:', error);
            throw error;
        }
    }
}
exports.AddEncryptionFieldsMigration = AddEncryptionFieldsMigration;
// Run migration if called directly
if (require.main === module) {
    mongoose_1.default.connect(process.env.MONGODB_URI)
        .then(() => AddEncryptionFieldsMigration.up())
        .then(() => process.exit(0))
        .catch((error) => {
        console.error('Migration failed:', error);
        process.exit(1);
    });
}
//# sourceMappingURL=001-add-encryption-fields.js.map