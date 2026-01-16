const fs = require('fs');
const path = require('path');

function changeBackendEndpoint(newPort, newHost = 'localhost') {
  console.log(`Changing backend endpoint to ${newHost}:${newPort}...\n`);

  try {
    // 1. Update backend .env
    const backendEnvPath = path.join(__dirname, 'backend', '.env');
    let backendEnv = fs.readFileSync(backendEnvPath, 'utf8');
    backendEnv = backendEnv.replace(/PORT=\d+/, `PORT=${newPort}`);
    fs.writeFileSync(backendEnvPath, backendEnv);
    console.log('✅ Updated backend/.env');

    // 2. Create/update admin .env.local
    const adminEnvPath = path.join(__dirname, 'admin', '.env.local');
    const adminEnvContent = `VITE_API_BASE_URL=http://${newHost}:${newPort}\n`;
    fs.writeFileSync(adminEnvPath, adminEnvContent);
    console.log('✅ Updated admin/.env.local');

    // 3. Update mobile app config
    const mobileConfigPath = path.join(__dirname, 'app', 'config', 'env.js');
    let mobileConfig = fs.readFileSync(mobileConfigPath, 'utf8');
    
    // Replace the API_BASE_URL in development section
    const newApiUrl = `http://${newHost}:${newPort}/api`;
    mobileConfig = mobileConfig.replace(
      /API_BASE_URL:\s*['"][^'"]*['"]/,
      `API_BASE_URL: '${newApiUrl}'`
    );
    
    fs.writeFileSync(mobileConfigPath, mobileConfig);
    console.log('✅ Updated app/config/env.js');

    console.log('\n🎉 Backend endpoint changed successfully!');
    console.log(`\nNew endpoints:`);
    console.log(`  Backend: http://${newHost}:${newPort}`);
    console.log(`  Admin Panel: http://${newHost}:${newPort} (via proxy)`);
    console.log(`  Mobile App: ${newApiUrl}`);
    
    console.log('\n📝 Next steps:');
    console.log('  1. Restart the backend server');
    console.log('  2. Restart the admin panel dev server');
    console.log('  3. Restart the mobile app (Expo)');

  } catch (error) {
    console.error('❌ Error changing endpoint:', error.message);
  }
}

// Get command line arguments
const args = process.argv.slice(2);
if (args.length === 0) {
  console.log('Usage: node change-backend-endpoint.js <port> [host]');
  console.log('Examples:');
  console.log('  node change-backend-endpoint.js 3001');
  console.log('  node change-backend-endpoint.js 5000 192.168.1.100');
  console.log('  node change-backend-endpoint.js 8080 myserver.local');
  process.exit(1);
}

const newPort = args[0];
const newHost = args[1] || 'localhost';

changeBackendEndpoint(newPort, newHost);