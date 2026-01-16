/**
 * Create Test PLN Application
 * 
 * This script creates a test PLN application in the database
 * so you can test the tracking functionality.
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/roads-authority';

// PLN Schema (simplified version)
const plnSchema = new mongoose.Schema({
  referenceId: { type: String, required: true, unique: true },
  trackingPin: { type: String, required: true },
  fullName: { type: String, required: true },
  idNumber: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  plateChoices: [{
    text: String,
    meaning: String,
  }],
  status: { 
    type: String, 
    enum: ['submitted', 'under-review', 'payment-required', 'payment-received', 'approved', 'rejected', 'completed'],
    default: 'submitted'
  },
  statusHistory: [{
    status: String,
    timestamp: Date,
    comment: String,
  }],
  documentUrl: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

async function createTestApplication() {
  console.log('🚀 Creating test PLN application...\n');
  
  try {
    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    console.log('   URI:', MONGODB_URI);
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get or create PLN model
    const PLN = mongoose.models.PLN || mongoose.model('PLN', plnSchema);

    // Generate unique reference ID
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    const referenceId = `PLN-2024-${timestamp}${random}`;

    // Create test application
    const testApplication = {
      referenceId,
      trackingPin: '12345', // Legacy field, not used for tracking
      fullName: 'John Doe',
      idNumber: '1234567890123', // 13-digit ID number used for tracking
      phoneNumber: '+264811234567',
      plateChoices: [
        { text: 'TEST1', meaning: 'First test plate' },
        { text: 'TEST2', meaning: 'Second test plate' },
        { text: 'TEST3', meaning: 'Third test plate' },
      ],
      status: 'submitted',
      statusHistory: [
        {
          status: 'submitted',
          timestamp: new Date(),
          comment: 'Application submitted successfully',
        },
      ],
      documentUrl: 'https://example.com/test-document.pdf',
    };

    console.log('📝 Creating application with details:');
    console.log('   Reference ID:', referenceId);
    console.log('   ID Number: 1234567890123 (use this for tracking)');
    console.log('   Full Name:', testApplication.fullName);
    console.log('   Status:', testApplication.status);
    console.log('');

    const application = await PLN.create(testApplication);
    
    console.log('✅ Test application created successfully!\n');
    console.log('═══════════════════════════════════════════════════════');
    console.log('📱 USE THESE CREDENTIALS TO TEST TRACKING:');
    console.log('═══════════════════════════════════════════════════════');
    console.log('');
    console.log('   Reference ID: ' + referenceId);
    console.log('   ID Number: 1234567890123');
    console.log('');
    console.log('═══════════════════════════════════════════════════════');
    console.log('');
    console.log('💡 Open your mobile app and go to "Track PLN Application"');
    console.log('   Enter the credentials above to test the tracking feature.');
    console.log('');

  } catch (error) {
    console.error('❌ Error creating test application:', error.message);
    if (error.code === 11000) {
      console.log('\n⚠️  A test application might already exist.');
      console.log('   Try checking existing applications first.');
    }
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB\n');
  }
}

// Run the script
createTestApplication();
