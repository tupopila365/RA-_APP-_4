const mongoose = require('./backend/node_modules/mongoose');
require('./backend/node_modules/dotenv').config({ path: './backend/.env' });

const plnApplicationSchema = new mongoose.Schema({
  referenceId: { type: String, required: true, unique: true },
  fullName: String,
  idNumber: String,
  phone: String,
  email: String,
  propertyType: String,
  plotNumber: String,
  propertySize: Number,
  propertyAddress: String,
  district: String,
  constituency: String,
  communityCouncil: String,
  village: String,
  coordinates: {
    latitude: Number,
    longitude: Number
  },
  status: String,
  createdAt: { type: Date, default: Date.now }
});

const PLNApplication = mongoose.model('PLNApplication', plnApplicationSchema);

async function createTestApplication() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Generate reference ID
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    const referenceId = `PLN-2026-${timestamp}${random}`;

    const testApp = new PLNApplication({
      referenceId: referenceId,
      fullName: 'Test User',
      idNumber: '12345678',
      phone: '+26771234567',
      email: 'test@example.com',
      propertyType: 'Residential',
      plotNumber: 'TEST-001',
      propertySize: 500,
      propertyAddress: '123 Test Street, Maseru',
      district: 'Maseru',
      constituency: 'Maseru Central',
      communityCouncil: 'Maseru Urban',
      village: 'Ha Abia',
      coordinates: {
        latitude: -29.3167,
        longitude: 27.4833
      },
      status: 'pending'
    });

    await testApp.save();
    
    console.log('\n✅ TEST APPLICATION CREATED!\n');
    console.log('═══════════════════════════════════════════════════════');
    console.log('📋 REFERENCE ID (Copy this to your phone):');
    console.log('');
    console.log(`   ${referenceId}`);
    console.log('');
    console.log('═══════════════════════════════════════════════════════');
    console.log('\n📱 Test on your phone:');
    console.log('   1. Open PLN Tracking screen');
    console.log('   2. Enter the reference ID above');
    console.log('   3. Try uppercase, lowercase, or mixed case');
    console.log('\n👤 Applicant: Test User');
    console.log('📍 Location: Ha Abia, Maseru');
    console.log('📊 Status: Pending\n');

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

createTestApplication();
