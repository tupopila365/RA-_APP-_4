/**
 * Check user permissions in MongoDB
 * 
 * Usage: node check-user-permissions.js your-email@example.com
 */

const { MongoClient } = require('mongodb');
require('dotenv').config({ path: './backend/.env' });

const email = process.argv[2];

if (!email) {
  console.error('Usage: node check-user-permissions.js <email>');
  console.error('Example: node check-user-permissions.js admin@example.com');
  process.exit(1);
}

const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
  console.error('❌ MONGODB_URI not found in backend/.env file');
  process.exit(1);
}

async function checkPermissions() {
  const client = new MongoClient(mongoUri);
  
  try {
    console.log('Connecting to MongoDB...');
    await client.connect();
    console.log('✅ Connected to MongoDB\n');
    
    const db = client.db();
    const user = await db.collection('users').findOne({ email });
    
    if (!user) {
      console.log(`❌ User not found: ${email}`);
      console.log('\nAvailable users:');
      const users = await db.collection('users').find({}, { projection: { email: 1, role: 1 } }).toArray();
      users.forEach(u => console.log(`  - ${u.email} (${u.role})`));
      return;
    }
    
    console.log('📋 User Information:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Email:       ${user.email}`);
    console.log(`Name:        ${user.firstName} ${user.lastName}`);
    console.log(`Role:        ${user.role}`);
    console.log(`Active:      ${user.isActive ? '✅ Yes' : '❌ No'}`);
    console.log(`Verified:    ${user.isVerified ? '✅ Yes' : '❌ No'}`);
    console.log('');
    
    console.log('🔐 Permissions:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    if (user.role === 'super-admin') {
      console.log('✅ SUPER ADMIN - Has ALL permissions');
    } else if (user.permissions && user.permissions.length > 0) {
      user.permissions.forEach(perm => {
        const hasNewsManage = perm === 'news:manage';
        console.log(`  ${hasNewsManage ? '✅' : '  '} ${perm}`);
      });
      
      if (!user.permissions.includes('news:manage')) {
        console.log('');
        console.log('⚠️  WARNING: User does NOT have "news:manage" permission');
        console.log('   This is required to delete news articles.');
        console.log('');
        console.log('To fix, run this command in MongoDB:');
        console.log('');
        console.log(`db.users.updateOne(`);
        console.log(`  { email: "${email}" },`);
        console.log(`  { $addToSet: { permissions: "news:manage" } }`);
        console.log(`)`);
      } else {
        console.log('');
        console.log('✅ User has "news:manage" permission - can delete news articles');
      }
    } else {
      console.log('❌ No permissions assigned');
      console.log('');
      console.log('To add news:manage permission, run:');
      console.log('');
      console.log(`db.users.updateOne(`);
      console.log(`  { email: "${email}" },`);
      console.log(`  { $set: { permissions: ["news:manage"] } }`);
      console.log(`)`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
  }
}

checkPermissions();
