/**
 * Migration: Backfill userId for existing pothole reports
 * 
 * This migration updates existing pothole_reports records that have userEmail
 * but userId is NULL. It looks up the userId from the app_users table based on email.
 * 
 * Run this migration after deploying the userId field addition.
 */

const { AppDataSource } = require('../dist/config/db');
const { PotholeReport } = require('../dist/modules/pothole-reports/pothole-reports.entity');
const { AppUser } = require('../dist/modules/app-users/app-users.entity');

const backfillUserId = async () => {
  try {
    console.log('🔄 Starting userId backfill migration for pothole reports...');

    // Initialize database connection
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log('✅ Database connected');
    }

    const reportRepo = AppDataSource.getRepository(PotholeReport);
    const userRepo = AppDataSource.getRepository(AppUser);

    // Find all reports with userEmail but userId is NULL
    const reportsToUpdate = await reportRepo
      .createQueryBuilder('report')
      .where('report.userEmail IS NOT NULL')
      .andWhere('report.userId IS NULL')
      .getMany();

    console.log(`📊 Found ${reportsToUpdate.length} reports to update`);

    let updatedCount = 0;
    let notFoundCount = 0;
    let errorCount = 0;

    for (const report of reportsToUpdate) {
      try {
        if (!report.userEmail) {
          continue;
        }

        // Look up user by email
        const user = await userRepo.findOne({
          where: { email: report.userEmail.toLowerCase().trim() },
          select: ['id'],
        });

        if (user) {
          // Update report with userId
          report.userId = user.id;
          await reportRepo.save(report);
          updatedCount++;
          console.log(`✅ Updated report ${report.id}: userId=${user.id} for email=${report.userEmail}`);
        } else {
          notFoundCount++;
          console.log(`⚠️  User not found for email: ${report.userEmail} (report ${report.id})`);
        }
      } catch (error) {
        errorCount++;
        console.error(`❌ Error updating report ${report.id}:`, error.message);
      }
    }

    console.log('\n📈 Migration Summary:');
    console.log(`✅ Successfully updated: ${updatedCount} reports`);
    console.log(`⚠️  Users not found: ${notFoundCount} reports`);
    console.log(`❌ Errors: ${errorCount} reports`);
    console.log(`📊 Total processed: ${reportsToUpdate.length} reports`);

    if (updatedCount > 0) {
      console.log('\n✅ Migration completed successfully!');
      console.log('Users can now view their reports using userId.');
    } else if (notFoundCount > 0) {
      console.log('\n⚠️  Migration completed with warnings.');
      console.log('Some reports could not be linked to users (emails not found in app_users table).');
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('📴 Database connection closed');
    }
  }
};

// Run migration if this file is executed directly
if (require.main === module) {
  backfillUserId()
    .then(() => {
      console.log('\n🎉 Migration script completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Migration script failed:', error);
      process.exit(1);
    });
}

module.exports = { backfillUserId };
