import mongoose from 'mongoose';
import { RoadworkModel } from '../modules/roadworks/roadworks.model';
import { logger } from '../utils/logger';
import { env } from '../config/env';

/**
 * Migration: Update roadworks schema to include new fields
 * 
 * This migration adds the following fields to existing roadworks:
 * - region (required) - defaults to 'Khomas' for existing records
 * - published (boolean) - defaults to false for existing records
 * - priority (enum) - defaults to 'medium' for existing records
 * - description (string) - optional
 * - coordinates (object) - optional
 * - alternativeRoute (string) - optional
 * - affectedLanes (string) - optional
 * - contractor (string) - optional
 * - estimatedDuration (string) - optional
 * - completedAt (date) - optional
 * 
 * Also updates status values to match new enum
 */

const OLD_TO_NEW_STATUS_MAP: Record<string, string> = {
  'Planned': 'Planned Works',
  'Ongoing': 'Ongoing Maintenance',
  'Completed': 'Completed',
};

export async function up(): Promise<void> {
  try {
    logger.info('Starting roadworks schema migration...');

    // Connect to database if not already connected
    if (mongoose.connection.readyState !== 1) {
      logger.info('Connecting to MongoDB...');
      await mongoose.connect(env.MONGODB_URI);
      logger.info('Connected to MongoDB successfully');
    }

    // Get all existing roadworks
    const existingRoadworks = await RoadworkModel.find({}).lean();
    logger.info(`Found ${existingRoadworks.length} existing roadworks to migrate`);

    let migratedCount = 0;
    let errorCount = 0;

    for (const roadwork of existingRoadworks) {
      try {
        const updates: any = {};

        // Add region if missing (required field)
        if (!(roadwork as any).region) {
          // Try to infer region from area, otherwise default to Khomas
          const area = ((roadwork as any).area?.toLowerCase() || '') as string;
          if (area.includes('windhoek') || area.includes('khomas')) {
            updates.region = 'Khomas';
          } else if (area.includes('swakopmund') || area.includes('walvis') || area.includes('erongo')) {
            updates.region = 'Erongo';
          } else if (area.includes('mariental') || area.includes('hardap')) {
            updates.region = 'Hardap';
          } else if (area.includes('keetmanshoop') || area.includes('karas')) {
            updates.region = 'ǁKaras';
          } else {
            // Default to Khomas for unknown areas
            updates.region = 'Khomas';
          }
        }

        // Add published field if missing
        if ((roadwork as any).published === undefined) {
          // Set to true for ongoing/planned works, false for completed
          updates.published = ['Planned', 'Ongoing', 'Planned Works', 'Ongoing Maintenance'].includes((roadwork as any).status);
        }

        // Add priority field if missing
        if (!(roadwork as any).priority) {
          // Set priority based on status
          if ((roadwork as any).status === 'Closed') {
            updates.priority = 'critical';
          } else if ((roadwork as any).status === 'Restricted') {
            updates.priority = 'high';
          } else if ((roadwork as any).status === 'Ongoing') {
            updates.priority = 'medium';
          } else {
            updates.priority = 'low';
          }
        }

        // Update status values to new enum
        if ((roadwork as any).status && OLD_TO_NEW_STATUS_MAP[(roadwork as any).status]) {
          updates.status = OLD_TO_NEW_STATUS_MAP[(roadwork as any).status];
        }

        // Add description from existing fields if missing
        if (!(roadwork as any).description && (roadwork as any).trafficControl) {
          updates.description = (roadwork as any).trafficControl;
        }

        // Only update if there are changes
        if (Object.keys(updates).length > 0) {
          await RoadworkModel.findByIdAndUpdate(
            (roadwork as any)._id,
            { $set: updates },
            { runValidators: true }
          );
          migratedCount++;
        }

      } catch (error: any) {
        logger.error(`Error migrating roadwork ${(roadwork as any)._id}:`, error);
        errorCount++;
      }
    }

    logger.info(`Migration completed: ${migratedCount} roadworks migrated, ${errorCount} errors`);

    // Create indexes for new fields
    try {
      await RoadworkModel.collection.createIndex({ region: 1, status: 1 });
      await RoadworkModel.collection.createIndex({ published: 1, status: 1 });
      await RoadworkModel.collection.createIndex({ priority: 1, status: 1 });
      logger.info('Created new indexes for region, published, and priority fields');
    } catch (indexError: any) {
      logger.warn('Error creating indexes (may already exist):', indexError.message);
    }

  } catch (error: any) {
    logger.error('Migration failed:', error);
    throw error;
  }
}

export async function down(): Promise<void> {
  try {
    logger.info('Rolling back roadworks schema migration...');

    // Connect to database if not already connected
    if (mongoose.connection.readyState !== 1) {
      logger.info('Connecting to MongoDB...');
      await mongoose.connect(env.MONGODB_URI);
      logger.info('Connected to MongoDB successfully');
    }

    // Remove the new fields from all documents
    await RoadworkModel.updateMany(
      {},
      {
        $unset: {
          region: '',
          published: '',
          priority: '',
          description: '',
          coordinates: '',
          alternativeRoute: '',
          affectedLanes: '',
          contractor: '',
          estimatedDuration: '',
          completedAt: '',
        }
      }
    );

    // Revert status values
    const reverseStatusMap = Object.fromEntries(
      Object.entries(OLD_TO_NEW_STATUS_MAP).map(([old, new_]) => [new_, old])
    );

    for (const [newStatus, oldStatus] of Object.entries(reverseStatusMap)) {
      await RoadworkModel.updateMany(
        { status: newStatus },
        { $set: { status: oldStatus } }
      );
    }

    // Drop the new indexes
    try {
      await RoadworkModel.collection.dropIndex('region_1_status_1');
      await RoadworkModel.collection.dropIndex('published_1_status_1');
      await RoadworkModel.collection.dropIndex('priority_1_status_1');
      logger.info('Dropped new indexes');
    } catch (indexError: any) {
      logger.warn('Error dropping indexes:', indexError.message);
    }

    logger.info('Migration rollback completed');

  } catch (error: any) {
    logger.error('Migration rollback failed:', error);
    throw error;
  }
}

// CLI execution
if (require.main === module) {
  const command = process.argv[2];
  
  if (command === 'up') {
    up().then(() => {
      console.log('Migration completed successfully');
      mongoose.connection.close();
      process.exit(0);
    }).catch((error) => {
      console.error('Migration failed:', error);
      mongoose.connection.close();
      process.exit(1);
    });
  } else if (command === 'down') {
    down().then(() => {
      console.log('Migration rollback completed successfully');
      mongoose.connection.close();
      process.exit(0);
    }).catch((error) => {
      console.error('Migration rollback failed:', error);
      mongoose.connection.close();
      process.exit(1);
    });
  } else {
    console.log('Usage: ts-node 002-update-roadworks-schema.ts [up|down]');
    process.exit(1);
  }
}