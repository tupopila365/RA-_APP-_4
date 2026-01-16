/**
 * Check All MongoDB Collections
 * 
 * This script checks what collections exist and what data they contain
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: './backend/.env' });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/road-authority';

// Colors
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function section(title) {
  console.log('\n' + '='.repeat(80));
  log(title, 'bright');
  console.log('='.repeat(80) + '\n');
}

async function checkAllCollections() {
  try {
    section('🔍 MONGODB COLLECTIONS CHECKER');

    log('📡 Connecting to MongoDB...', 'cyan');
    await mongoose.connect(MONGODB_URI);
    log('✅ Connected to MongoDB successfully\n', 'green');

    // Get all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    log(`Found ${collections.length} collection(s):\n`, 'bright');

    for (const collection of collections) {
      const collectionName = collection.name;
      
      section(`📦 Collection: ${collectionName}`);
      
      // Get count
      const count = await mongoose.connection.db.collection(collectionName).countDocuments();
      log(`Total documents: ${colors.bright}${count}${colors.reset}`, 'cyan');
      
      if (count > 0) {
        // Get sample document
        const sample = await mongoose.connection.db.collection(collectionName).findOne({});
        
        log('\nSample document structure:', 'yellow');
        log('Fields:', 'cyan');
        
        const fields = Object.keys(sample);
        fields.forEach(field => {
          const value = sample[field];
          const type = Array.isArray(value) ? 'Array' : typeof value;
          console.log(`  • ${field}: ${colors.magenta}${type}${colors.reset}`);
        });
        
        // Show first document
        log('\nFirst document:', 'yellow');
        console.log(JSON.stringify(sample, null, 2));
        
        // Check if this looks like PLN applications
        const hasPLNFields = fields.includes('plateChoices') || 
                            fields.includes('trackingPin') || 
                            fields.includes('vehicleRegisterNumber');
        
        const hasPropertyFields = fields.includes('propertyType') || 
                                 fields.includes('plotNumber') || 
                                 fields.includes('propertyAddress');
        
        if (hasPLNFields) {
          log('\n✅ This looks like PLN (License Plate) applications', 'green');
        } else if (hasPropertyFields) {
          log('\n⚠️  This looks like Property/Land applications', 'yellow');
        } else if (fields.includes('referenceId')) {
          log('\n❓ This has referenceId but unclear application type', 'yellow');
        }
      } else {
        log('  (Empty collection)', 'yellow');
      }
    }

    // Check for specific PLN-related collections
    section('🔍 LOOKING FOR PLN APPLICATIONS');
    
    const plnCollectionNames = ['plns', 'pln', 'plnapplications', 'licenseplates', 'plates'];
    let foundPLN = false;
    
    for (const name of plnCollectionNames) {
      const exists = collections.find(c => c.name.toLowerCase() === name.toLowerCase());
      if (exists) {
        const count = await mongoose.connection.db.collection(exists.name).countDocuments();
        log(`✅ Found: ${exists.name} (${count} documents)`, 'green');
        foundPLN = true;
      }
    }
    
    if (!foundPLN) {
      log('❌ No PLN-specific collections found!', 'red');
      log('\nPossible reasons:', 'yellow');
      log('  1. PLN applications are stored in a different collection', 'yellow');
      log('  2. No PLN applications have been created yet', 'yellow');
      log('  3. Wrong database or connection string', 'yellow');
    }

    // Check for property-related collections
    section('🏠 LOOKING FOR PROPERTY APPLICATIONS');
    
    const propertyCollectionNames = ['properties', 'property', 'land', 'plots'];
    let foundProperty = false;
    
    for (const name of propertyCollectionNames) {
      const exists = collections.find(c => c.name.toLowerCase() === name.toLowerCase());
      if (exists) {
        const count = await mongoose.connection.db.collection(exists.name).countDocuments();
        log(`✅ Found: ${exists.name} (${count} documents)`, 'green');
        foundProperty = true;
      }
    }

    // Summary
    section('📊 SUMMARY');
    
    log('Database: ' + MONGODB_URI, 'cyan');
    log('Total collections: ' + collections.length, 'cyan');
    
    if (foundPLN) {
      log('\n✅ PLN application collections found', 'green');
    } else {
      log('\n❌ No PLN application collections found', 'red');
    }
    
    if (foundProperty) {
      log('✅ Property application collections found', 'green');
    }

    section('💡 RECOMMENDATIONS');
    
    log('Based on the data you showed:', 'cyan');
    log('  • Your applications have property fields (propertyType, plotNumber, etc.)', 'yellow');
    log('  • These are NOT PLN (license plate) applications', 'yellow');
    log('  • You may be looking at the wrong collection or application type', 'yellow');
    
    log('\nTo track PLN applications, you need:', 'cyan');
    log('  • Applications with plateChoices field', 'bright');
    log('  • Applications with trackingPin field', 'bright');
    log('  • Applications with vehicleRegisterNumber field', 'bright');
    
    log('\nNext steps:', 'cyan');
    log('  1. Check if you have a separate PLN collection', 'bright');
    log('  2. Verify you\'re looking at the correct database', 'bright');
    log('  3. Create a test PLN application to verify the system', 'bright');

  } catch (error) {
    log(`\n❌ Error: ${error.message}`, 'red');
    console.error(error);
  } finally {
    await mongoose.disconnect();
    log('\n📡 Disconnected from MongoDB', 'cyan');
  }
}

checkAllCollections().catch(console.error);
