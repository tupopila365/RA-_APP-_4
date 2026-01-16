/**
 * Quick PLN Tracking Status Check
 * 
 * Quickly checks if PLN tracking is working
 */

const mongoose = require('mongoose');
const axios = require('axios');
require('dotenv').config({ path: './backend/.env' });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/road-authority';
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000/api';

const plnSchema = new mongoose.Schema({
  referenceId: String,
  trackingPin: String,
  fullName: String,
  surname: String,
  initials: String,
  status: String,
}, { collection: 'plns' });

const PLN = mongoose.model('PLN', plnSchema);

async function quickCheck() {
  console.log('🔍 Quick PLN Tracking Status Check\n');

  try {
    // 1. Check MongoDB
    console.log('1️⃣  Checking MongoDB...');
    await mongoose.connect(MONGODB_URI);
    const count = await PLN.countDocuments();
    console.log(`   ✅ MongoDB connected - ${count} application(s) found\n`);

    if (count === 0) {
      console.log('   ⚠️  No applications found. Create one first!\n');
      await mongoose.disconnect();
      return;
    }

    // 2. Get test data
    const testApp = await PLN.findOne({}).sort({ createdAt: -1 });
    console.log('2️⃣  Test Application:');
    console.log(`   Reference ID: ${testApp.referenceId}`);
    console.log(`   Name: ${testApp.fullName || `${testApp.surname} ${testApp.initials}` || 'N/A'}`);
    console.log(`   PIN: ${testApp.trackingPin || 'NOT SET'}\n`);

    await mongoose.disconnect();

    // 3. Check Backend API
    console.log('3️⃣  Checking Backend API...');
    try {
      const response = await axios.get(
        `${API_BASE_URL}/pln/track/${testApp.referenceId}/12345`,
        { timeout: 5000 }
      );
      
      if (response.data.success) {
        console.log('   ✅ Backend API is working!\n');
        
        console.log('4️⃣  Test Credentials:');
        console.log(`   Reference ID: ${testApp.referenceId}`);
        console.log(`   PIN: 12345\n`);
        
        console.log('✅ PLN TRACKING IS WORKING!');
        console.log('\nYou can now test in the mobile app with the credentials above.');
      } else {
        console.log('   ❌ Backend returned error\n');
        console.log(response.data);
      }
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.log('   ❌ Cannot connect to backend');
        console.log(`   Is the backend running on ${API_BASE_URL}?\n`);
      } else if (error.response) {
        console.log(`   ❌ Backend error: ${error.response.status}`);
        console.log(`   Message: ${error.response.data?.error?.message || error.response.data?.message}\n`);
      } else {
        console.log(`   ❌ Error: ${error.message}\n`);
      }
      
      console.log('❌ PLN TRACKING HAS ISSUES');
      console.log('\nRun full diagnostics:');
      console.log('  node debug-pln-tracking.js');
      console.log('  node test-pln-tracking-api.js');
    }

  } catch (error) {
    console.log(`❌ Error: ${error.message}\n`);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('MongoDB is not running. Start it first:');
      console.log('  mongod');
    }
  }
}

quickCheck().catch(console.error);
