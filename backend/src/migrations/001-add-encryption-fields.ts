import mongoose from 'mongoose';
import { PLNModel } from '../modules/pln/pln.model';
import { FieldEncryption } from '../utils/encryption';
import { logger } from '../utils/logger';

/**
 * Migration to add encrypted fields to existing PLN records
 */
export class AddEncryptionFieldsMigration {
  static async up(): Promise<void> {
    logger.info('Starting encryption fields migration...');
    
    try {
      // Get all PLN records that don't have encrypted fields
      const records = await PLNModel.find({
        $or: [
          { surname_encrypted: { $exists: false } },
          { initials_encrypted: { $exists: false } },
        ]
      });

      logger.info(`Found ${records.length} records to migrate`);

      let migrated = 0;
      let errors = 0;

      for (const record of records) {
        try {
          const updates: any = {};

          // Encrypt text fields
          if (record.surname && !record.surname_encrypted) {
            updates.surname_encrypted = FieldEncryption.encrypt(record.surname);
            updates.surname_hash = FieldEncryption.hash(record.surname.toLowerCase());
          }

          if (record.initials && !record.initials_encrypted) {
            updates.initials_encrypted = FieldEncryption.encrypt(record.initials);
          }

          if (record.businessName && !record.businessName_encrypted) {
            updates.businessName_encrypted = FieldEncryption.encrypt(record.businessName);
          }

          if (record.email && !record.email_encrypted) {
            updates.email_encrypted = FieldEncryption.encrypt(record.email);
            updates.email_hash = FieldEncryption.hash(record.email.toLowerCase());
          }

          // Encrypt ID numbers
          if (record.trafficRegisterNumber && !record.trafficRegisterNumber_encrypted) {
            updates.trafficRegisterNumber_encrypted = FieldEncryption.encrypt(record.trafficRegisterNumber);
            updates.trafficRegisterNumber_hash = FieldEncryption.hash(record.trafficRegisterNumber);
          }

          if (record.businessRegNumber && !record.businessRegNumber_encrypted) {
            updates.businessRegNumber_encrypted = FieldEncryption.encrypt(record.businessRegNumber);
            updates.businessRegNumber_hash = FieldEncryption.hash(record.businessRegNumber);
          }

          // Encrypt legacy fields
          if (record.fullName && !record.fullName_encrypted) {
            updates.fullName_encrypted = FieldEncryption.encrypt(record.fullName);
            updates.fullName_hash = FieldEncryption.hash(record.fullName.toLowerCase());
          }

          if (record.idNumber && !record.idNumber_encrypted) {
            updates.idNumber_encrypted = FieldEncryption.encrypt(record.idNumber);
            updates.idNumber_hash = FieldEncryption.hash(record.idNumber);
          }

          if (record.phoneNumber && !record.phoneNumber_encrypted) {
            updates.phoneNumber_encrypted = FieldEncryption.encrypt(record.phoneNumber);
          }

          // Update record
          if (Object.keys(updates).length > 0) {
            await PLNModel.updateOne({ _id: record._id }, updates);
            migrated++;
          }

          if (migrated % 100 === 0) {
            logger.info(`Migrated ${migrated} records...`);
          }
        } catch (error) {
          logger.error(`Failed to migrate record ${record._id}:`, error);
          errors++;
        }
      }

      logger.info(`Migration completed: ${migrated} migrated, ${errors} errors`);
    } catch (error) {
      logger.error('Migration failed:', error);
      throw error;
    }
  }

  static async down(): Promise<void> {
    logger.info('Rolling back encryption fields migration...');
    
    try {
      // Remove encrypted fields
      await PLNModel.updateMany({}, {
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

      logger.info('Rollback completed');
    } catch (error) {
      logger.error('Rollback failed:', error);
      throw error;
    }
  }
}

// Run migration if called directly
if (require.main === module) {
  mongoose.connect(process.env.MONGODB_URI!)
    .then(() => AddEncryptionFieldsMigration.up())
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}