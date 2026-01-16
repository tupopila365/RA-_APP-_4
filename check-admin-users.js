const axios = require('axios');

async function checkAdminUsers() {
  const BACKEND_URL = 'http://localhost:5001/api';
  
  console.log('🔍 Checking Admin User Setup...\n');
  
  // Test different common admin credentials
  const testCredentials = [
    { email: 'admin@roadsauthority.gov.na', password: 'admin123' },
    { email: 'admin@example.com', password: 'admin123' },
    { email: 'admin@admin.com', password: 'admin123' },
    { email: 'admin@localhost', password: 'admin123' },
    { email: 'admin', password: 'admin' },
    { email: 'admin', password: 'admin123' },
    { email: 'test@admin.com', password: 'password' },
    { email: 'super@admin.com', password: 'admin123' }
  ];
  
  console.log('Testing common admin credentials...\n');
  
  for (const creds of testCredentials) {
    try {
      console.log(`Testing: ${creds.email} / ${creds.password}`);
      
      const response = await axios.post(`${BACKEND_URL}/auth/login`, creds, {
        timeout: 5000,
        validateStatus: () => true
      });
      
      if (response.status === 200 && response.data.success) {
        console.log('✅ SUCCESS! Valid credentials found');
        console.log('   User:', response.data.data.user.email);
        console.log('   Role:', response.data.data.user.role);
        console.log('   Permissions:', response.data.data.user.permissions.join(', '));
        console.log('   Has roadworks:manage:', response.data.data.user.permissions.includes('roadworks:manage'));
        return { success: true, credentials: creds, user: response.data.data.user };
      } else {
        console.log(`❌ Failed: ${response.data.error?.message || 'Invalid credentials'}`);
      }
      
    } catch (error) {
      console.log(`❌ Error: ${error.response?.data?.error?.message || error.message}`);
    }
  }
  
  console.log('\n❌ No valid admin credentials found!');
  console.log('\nThis is likely why roadwork saving is failing.');
  console.log('You need to either:');
  console.log('1. Create an admin user');
  console.log('2. Use the correct existing admin credentials');
  
  return { success: false };
}

// Also check if there's a user creation endpoint
async function checkUserCreation() {
  const BACKEND_URL = 'http://localhost:5001/api';
  
  console.log('\n🔍 Checking if we can create an admin user...\n');
  
  try {
    // Try to create a test admin user
    const newUser = {
      email: 'test-admin@roadsauthority.gov.na',
      password: 'admin123',
      firstName: 'Test',
      lastName: 'Admin',
      role: 'admin'
    };
    
    const response = await axios.post(`${BACKEND_URL}/auth/register`, newUser, {
      timeout: 10000,
      validateStatus: () => true
    });
    
    console.log('User creation response:', response.status);
    console.log('Response:', response.data);
    
    if (response.status === 201 && response.data.success) {
      console.log('✅ Successfully created test admin user');
      return { success: true, credentials: { email: newUser.email, password: newUser.password } };
    } else {
      console.log('❌ User creation failed or not allowed');
    }
    
  } catch (error) {
    console.log('❌ User creation error:', error.response?.data?.error?.message || error.message);
  }
  
  return { success: false };
}

async function main() {
  const loginResult = await checkAdminUsers();
  
  if (!loginResult.success) {
    const createResult = await checkUserCreation();
    
    if (createResult.success) {
      console.log('\n✅ Test admin user created. Try logging in with:');
      console.log(`   Email: ${createResult.credentials.email}`);
      console.log(`   Password: ${createResult.credentials.password}`);
    } else {
      console.log('\n❌ Could not create admin user. Check if:');
      console.log('1. There are existing admin users in the database');
      console.log('2. The registration endpoint is enabled');
      console.log('3. The database is properly connected');
    }
  }
}

main();