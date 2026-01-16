/**
 * Diagnostic Script: PLN Status Sync Issue
 * 
 * This script helps diagnose why users aren't seeing status updates
 * made by admins on their PLN applications.
 */

const mongoose = require('mongoose');
const path = require('path');

// Try to load from backend directory
const envPath = path.join(__dirname, 'backend', '.env');
require('dotenv').config({ path: envPath });

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/road-authority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const PLNSchema = new mongoose.Schema({}, { strict: false, collection: 'plnapplications' });
const PLNModel = mongoose.model('PLNApplication', PLNSchema);

async function diagnosePLNStatusSync() {
  try {
    console.log('🔍 Diagnosing PLN Status Sync Issue...\n');

    // Get all applications
    const applications = await PLNModel.find({}).sort({ updatedAt: -1 }).limit(10);

    console.log(`📊 Found ${applications.length} recent applications\n`);

    for (const app of applications) {
      console.log('─'.repeat(80));
      console.log(`📋 Application: ${app.referenceId}`);
      console.log(`   ID: ${app._id}`);
      console.log(`   Status: ${app.status}`);
      console.log(`   Created: ${app.createdAt}`);
      console.log(`   Updated: ${app.updatedAt}`);
      console.log(`   Tracking PIN: ${app.trackingPin || '12345'}`);
      
      if (app.statusHistory && app.statusHistory.length > 0) {
        console.log(`\n   📜 Status History (${app.statusHistory.length} entries):`);
        app.statusHistory.forEach((history, index) => {
          console.log(`      ${index + 1}. ${history.status} - ${history.timestamp}`);
          console.log(`         Changed by: ${history.changedBy}`);
          if (history.comment) {
            console.log(`         Comment: ${history.comment}`);
          }
        });
      }

      if (app.adminComments) {
        console.log(`\n   💬 Admin Comments: ${app.adminComments}`);
      }

      // Check if status was recently updated
      const timeSinceUpdate = Date.now() - new Date(app.updatedAt).getTime();
      const minutesSinceUpdate = Math.floor(timeSinceUpdate / 60000);
      
      if (minutesSinceUpdate < 60) {
        console.log(`\n   ⚠️  Recently updated ${minutesSinceUpdate} minutes ago`);
      }

      console.log('');
    }

    console.log('─'.repeat(80));
    console.log('\n🔍 DIAGNOSIS SUMMARY:\n');
    console.log('Common reasons users don\'t see status updates:');
    console.log('1. ❌ App is showing cached data (no auto-refresh)');
    console.log('2. ❌ User hasn\'t manually refreshed by re-entering tracking details');
    console.log('3. ❌ Status field in database doesn\'t match statusHistory');
    console.log('4. ❌ App is using old API endpoint or wrong reference ID format');
    console.log('5. ❌ Network issues preventing data fetch');
    console.log('\n💡 SOLUTIONS:\n');
    console.log('1. ✅ Add "Refresh" button to tracking screen');
    console.log('2. ✅ Implement auto-refresh every 30 seconds when viewing status');
    console.log('3. ✅ Add pull-to-refresh gesture');
    console.log('4. ✅ Show "Last updated" timestamp');
    console.log('5. ✅ Clear any client-side caching');
    console.log('6. ✅ Add real-time notifications (optional)');

    // Test the tracking endpoint
    console.log('\n🧪 Testing Tracking Endpoint...\n');
    
    if (applications.length > 0) {
      const testApp = applications[0];
      console.log(`Testing with: ${testApp.referenceId}`);
      
      // Simulate API call
      const found = await PLNModel.findOne({
        referenceId: { $regex: new RegExp(`^${testApp.referenceId}$`, 'i') },
      });

      if (found) {
        console.log('✅ Tracking endpoint would return:');
        console.log(`   Status: ${found.status}`);
        console.log(`   Updated: ${found.updatedAt}`);
        console.log(`   Status History Entries: ${found.statusHistory?.length || 0}`);
      } else {
        console.log('❌ Application not found via tracking endpoint');
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Diagnosis complete');
  }
}

diagnosePLNStatusSync();
