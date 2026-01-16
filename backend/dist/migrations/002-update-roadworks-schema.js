"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
const mongoose_1 = __importDefault(require("mongoose"));
const roadworks_model_1 = require("../modules/roadworks/roadworks.model");
const logger_1 = require("../utils/logger");
const env_1 = require("../config/env");
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
const OLD_TO_NEW_STATUS_MAP = {
    'Planned': 'Planned Works',
    'Ongoing': 'Ongoing Maintenance',
    'Completed': 'Completed',
};
async function up() {
    try {
        logger_1.logger.info('Starting roadworks schema migration...');
        // Connect to database if not already connected
        if (mongoose_1.default.connection.readyState !== 1) {
            logger_1.logger.info('Connecting to MongoDB...');
            await mongoose_1.default.connect(env_1.env.MONGODB_URI);
            logger_1.logger.info('Connected to MongoDB successfully');
        }
        // Get all existing roadworks
        const existingRoadworks = await roadworks_model_1.RoadworkModel.find({}).lean();
        logger_1.logger.info(`Found ${existingRoadworks.length} existing roadworks to migrate`);
        let migratedCount = 0;
        let errorCount = 0;
        for (const roadwork of existingRoadworks) {
            try {
                const updates = {};
                // Add region if missing (required field)
                if (!roadwork.region) {
                    // Try to infer region from area, otherwise default to Khomas
                    const area = (roadwork.area?.toLowerCase() || '');
                    if (area.includes('windhoek') || area.includes('khomas')) {
                        updates.region = 'Khomas';
                    }
                    else if (area.includes('swakopmund') || area.includes('walvis') || area.includes('erongo')) {
                        updates.region = 'Erongo';
                    }
                    else if (area.includes('mariental') || area.includes('hardap')) {
                        updates.region = 'Hardap';
                    }
                    else if (area.includes('keetmanshoop') || area.includes('karas')) {
                        updates.region = 'ǁKaras';
                    }
                    else {
                        // Default to Khomas for unknown areas
                        updates.region = 'Khomas';
                    }
                }
                // Add published field if missing
                if (roadwork.published === undefined) {
                    // Set to true for ongoing/planned works, false for completed
                    updates.published = ['Planned', 'Ongoing', 'Planned Works', 'Ongoing Maintenance'].includes(roadwork.status);
                }
                // Add priority field if missing
                if (!roadwork.priority) {
                    // Set priority based on status
                    if (roadwork.status === 'Closed') {
                        updates.priority = 'critical';
                    }
                    else if (roadwork.status === 'Restricted') {
                        updates.priority = 'high';
                    }
                    else if (roadwork.status === 'Ongoing') {
                        updates.priority = 'medium';
                    }
                    else {
                        updates.priority = 'low';
                    }
                }
                // Update status values to new enum
                if (roadwork.status && OLD_TO_NEW_STATUS_MAP[roadwork.status]) {
                    updates.status = OLD_TO_NEW_STATUS_MAP[roadwork.status];
                }
                // Add description from existing fields if missing
                if (!roadwork.description && roadwork.trafficControl) {
                    updates.description = roadwork.trafficControl;
                }
                // Only update if there are changes
                if (Object.keys(updates).length > 0) {
                    await roadworks_model_1.RoadworkModel.findByIdAndUpdate(roadwork._id, { $set: updates }, { runValidators: true });
                    migratedCount++;
                }
            }
            catch (error) {
                logger_1.logger.error(`Error migrating roadwork ${roadwork._id}:`, error);
                errorCount++;
            }
        }
        logger_1.logger.info(`Migration completed: ${migratedCount} roadworks migrated, ${errorCount} errors`);
        // Create indexes for new fields
        try {
            await roadworks_model_1.RoadworkModel.collection.createIndex({ region: 1, status: 1 });
            await roadworks_model_1.RoadworkModel.collection.createIndex({ published: 1, status: 1 });
            await roadworks_model_1.RoadworkModel.collection.createIndex({ priority: 1, status: 1 });
            logger_1.logger.info('Created new indexes for region, published, and priority fields');
        }
        catch (indexError) {
            logger_1.logger.warn('Error creating indexes (may already exist):', indexError.message);
        }
    }
    catch (error) {
        logger_1.logger.error('Migration failed:', error);
        throw error;
    }
}
async function down() {
    try {
        logger_1.logger.info('Rolling back roadworks schema migration...');
        // Connect to database if not already connected
        if (mongoose_1.default.connection.readyState !== 1) {
            logger_1.logger.info('Connecting to MongoDB...');
            await mongoose_1.default.connect(env_1.env.MONGODB_URI);
            logger_1.logger.info('Connected to MongoDB successfully');
        }
        // Remove the new fields from all documents
        await roadworks_model_1.RoadworkModel.updateMany({}, {
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
        });
        // Revert status values
        const reverseStatusMap = Object.fromEntries(Object.entries(OLD_TO_NEW_STATUS_MAP).map(([old, new_]) => [new_, old]));
        for (const [newStatus, oldStatus] of Object.entries(reverseStatusMap)) {
            await roadworks_model_1.RoadworkModel.updateMany({ status: newStatus }, { $set: { status: oldStatus } });
        }
        // Drop the new indexes
        try {
            await roadworks_model_1.RoadworkModel.collection.dropIndex('region_1_status_1');
            await roadworks_model_1.RoadworkModel.collection.dropIndex('published_1_status_1');
            await roadworks_model_1.RoadworkModel.collection.dropIndex('priority_1_status_1');
            logger_1.logger.info('Dropped new indexes');
        }
        catch (indexError) {
            logger_1.logger.warn('Error dropping indexes:', indexError.message);
        }
        logger_1.logger.info('Migration rollback completed');
    }
    catch (error) {
        logger_1.logger.error('Migration rollback failed:', error);
        throw error;
    }
}
// CLI execution
if (require.main === module) {
    const command = process.argv[2];
    if (command === 'up') {
        up().then(() => {
            console.log('Migration completed successfully');
            mongoose_1.default.connection.close();
            process.exit(0);
        }).catch((error) => {
            console.error('Migration failed:', error);
            mongoose_1.default.connection.close();
            process.exit(1);
        });
    }
    else if (command === 'down') {
        down().then(() => {
            console.log('Migration rollback completed successfully');
            mongoose_1.default.connection.close();
            process.exit(0);
        }).catch((error) => {
            console.error('Migration rollback failed:', error);
            mongoose_1.default.connection.close();
            process.exit(1);
        });
    }
    else {
        console.log('Usage: ts-node 002-update-roadworks-schema.ts [up|down]');
        process.exit(1);
    }
}
//# sourceMappingURL=002-update-roadworks-schema.js.map