/**
 * Migration: Add alternate routes fields to existing roadworks
 * 
 * This migration adds the new structured alternate routes fields
 * to existing roadwork documents in the database.
 */

const mongoose = require('mongoose');

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/roads-authority';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Migration function
const migrateAlternateRoutes = async () => {
  try {
    console.log('🔄 Starting alternate routes migration...');

    // Get the roadworks collection
    const db = mongoose.connection.db;
    const roadworksCollection = db.collection('roadworks');

    // Find all roadworks that don't have the new fields
    const roadworksToUpdate = await roadworksCollection.find({
      $or: [
        { alternateRoutes: { $exists: false } },
        { roadClosure: { $exists: false } }
      ]
    }).toArray();

    console.log(`📊 Found ${roadworksToUpdate.length} roadworks to migrate`);

    let migratedCount = 0;
    let skippedCount = 0;

    for (const roadwork of roadworksToUpdate) {
      try {
        const updateData = {};

        // Add empty alternateRoutes array if it doesn't exist
        if (!roadwork.alternateRoutes) {
          updateData.alternateRoutes = [];
        }

        // Create roadClosure object from existing data if it doesn't exist
        if (!roadwork.roadClosure && roadwork.coordinates) {
          updateData.roadClosure = {
            roadCode: roadwork.road || 'Unknown',
            startTown: roadwork.area ? roadwork.area.split(' - ')[0] : undefined,
            endTown: roadwork.area ? roadwork.area.split(' - ')[1] : undefined,
            startCoordinates: roadwork.coordinates,
            endCoordinates: roadwork.coordinates,
            polylineCoordinates: [roadwork.coordinates, roadwork.coordinates]
          };
        }

        // Migrate legacy alternativeRoute text to structured format
        if (roadwork.alternativeRoute && roadwork.alternativeRoute.trim() && updateData.alternateRoutes.length === 0) {
          // Parse the alternative route text to create a basic structured route
          const alternativeText = roadwork.alternativeRoute.trim();
          
          // Extract road numbers from the text
          const roadMatches = alternativeText.match(/\b[A-Z]\d+\b/g) || [];
          
          // Extract town names (basic pattern matching)
          const townMatches = alternativeText.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?\b/g) || [];
          
          const basicRoute = {
            routeName: 'Alternative Route',
            roadsUsed: roadMatches,
            waypoints: townMatches.slice(0, 3).map((town, index) => ({
              name: town,
              coordinates: {
                // Generate approximate coordinates (this would need proper geocoding in production)
                latitude: roadwork.coordinates.latitude + (index * 0.1),
                longitude: roadwork.coordinates.longitude + (index * 0.1)
              }
            })),
            vehicleType: ['All'],
            distanceKm: 0, // Will be calculated by the service
            estimatedTime: '0m', // Will be calculated by the service
            polylineCoordinates: [],
            isRecommended: true,
            approved: false // Needs manual approval
          };

          updateData.alternateRoutes = [basicRoute];
        }

        // Update the document if there are changes
        if (Object.keys(updateData).length > 0) {
          await roadworksCollection.updateOne(
            { _id: roadwork._id },
            { $set: updateData }
          );
          migratedCount++;
          console.log(`✅ Migrated roadwork: ${roadwork.road} - ${roadwork.section}`);
        } else {
          skippedCount++;
        }

      } catch (error) {
        console.error(`❌ Error migrating roadwork ${roadwork._id}:`, error);
      }
    }

    console.log('\n📈 Migration Summary:');
    console.log(`✅ Successfully migrated: ${migratedCount} roadworks`);
    console.log(`⏭️ Skipped (no changes needed): ${skippedCount} roadworks`);
    console.log(`📊 Total processed: ${roadworksToUpdate.length} roadworks`);

    // Create indexes for the new fields
    console.log('\n🔍 Creating indexes for new fields...');
    
    await roadworksCollection.createIndex({ 'alternateRoutes.approved': 1 });
    await roadworksCollection.createIndex({ 'alternateRoutes.isRecommended': 1 });
    await roadworksCollection.createIndex({ 'roadClosure.roadCode': 1 });
    
    console.log('✅ Indexes created successfully');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
};

// Main execution
const runMigration = async () => {
  try {
    await connectDB();
    await migrateAlternateRoutes();
    console.log('\n🎉 Migration completed successfully!');
  } catch (error) {
    console.error('\n💥 Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('📴 Database connection closed');
  }
};

// Run migration if this file is executed directly
if (require.main === module) {
  runMigration();
}

module.exports = { migrateAlternateRoutes };