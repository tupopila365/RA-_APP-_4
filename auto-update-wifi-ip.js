/**
 * Automatic WiFi IP Detection and Configuration Update
 * 
 * This script automatically detects your current WiFi IP address and updates
 * the mobile app's env.js configuration file accordingly.
 * 
 * Usage:
 * - Run manually: node auto-update-wifi-ip.js
 * - Run with port: node auto-update-wifi-ip.js 5001
 * - Run in watch mode: node auto-update-wifi-ip.js --watch
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Configuration
const ENV_FILE_PATH = path.join(__dirname, 'app', 'config', 'env.js');
const DEFAULT_PORT = '5001';
const WATCH_INTERVAL = 30000; // Check every 30 seconds in watch mode

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

/**
 * Get the current WiFi IP address using multiple methods
 */
function getWiFiIPAddress() {
  try {
    // Method 1: Use os.networkInterfaces() (cross-platform)
    const interfaces = os.networkInterfaces();
    
    // Look for WiFi interface first
    const wifiInterfaces = ['WiFi', 'Wi-Fi', 'wlan0', 'wlp3s0'];
    for (const interfaceName of wifiInterfaces) {
      if (interfaces[interfaceName]) {
        for (const iface of interfaces[interfaceName]) {
          if (iface.family === 'IPv4' && !iface.internal) {
            logInfo(`Found WiFi IP via interface ${interfaceName}: ${iface.address}`);
            return iface.address;
          }
        }
      }
    }
    
    // Method 2: Look for any non-internal IPv4 address
    for (const interfaceName in interfaces) {
      for (const iface of interfaces[interfaceName]) {
        if (iface.family === 'IPv4' && !iface.internal && 
            !interfaceName.includes('VMware') && 
            !interfaceName.includes('VirtualBox') &&
            !interfaceName.includes('Hyper-V')) {
          logInfo(`Found IP via interface ${interfaceName}: ${iface.address}`);
          return iface.address;
        }
      }
    }
    
    // Method 3: Use ipconfig on Windows
    if (process.platform === 'win32') {
      const output = execSync('ipconfig', { encoding: 'utf8' });
      const wifiSection = output.split('Wireless LAN adapter WiFi:')[1];
      if (wifiSection) {
        const ipMatch = wifiSection.match(/IPv4 Address[.\s]*:\s*([0-9.]+)/);
        if (ipMatch) {
          logInfo(`Found WiFi IP via ipconfig: ${ipMatch[1]}`);
          return ipMatch[1];
        }
      }
    }
    
    throw new Error('No WiFi IP address found');
    
  } catch (error) {
    logError(`Failed to get WiFi IP: ${error.message}`);
    return null;
  }
}

/**
 * Read the current env.js file
 */
function readEnvFile() {
  try {
    if (!fs.existsSync(ENV_FILE_PATH)) {
      throw new Error(`env.js file not found at: ${ENV_FILE_PATH}`);
    }
    
    const content = fs.readFileSync(ENV_FILE_PATH, 'utf8');
    return content;
  } catch (error) {
    logError(`Failed to read env.js: ${error.message}`);
    return null;
  }
}

/**
 * Extract current IP from env.js content
 */
function getCurrentIPFromEnv(content) {
  const match = content.match(/API_BASE_URL:\s*'http:\/\/([0-9.]+):(\d+)\/api'/);
  if (match) {
    return { ip: match[1], port: match[2] };
  }
  return null;
}

/**
 * Update the env.js file with new IP address
 */
function updateEnvFile(newIP, port = DEFAULT_PORT) {
  try {
    let content = readEnvFile();
    if (!content) return false;
    
    // Update the main API_BASE_URL
    const oldPattern = /API_BASE_URL:\s*'http:\/\/[0-9.]+:\d+\/api'/g;
    const newURL = `API_BASE_URL: 'http://${newIP}:${port}/api'`;
    
    content = content.replace(oldPattern, newURL);
    
    // Update comments with the new IP
    content = content.replace(
      /\/\/ WiFi Network \(CURRENT\):/g,
      `// WiFi Network (CURRENT - ${new Date().toLocaleTimeString()}):`
    );
    
    // Write the updated content
    fs.writeFileSync(ENV_FILE_PATH, content, 'utf8');
    
    logSuccess(`Updated env.js with new IP: ${newIP}:${port}`);
    return true;
    
  } catch (error) {
    logError(`Failed to update env.js: ${error.message}`);
    return false;
  }
}

/**
 * Test if the backend is accessible on the given IP and port
 */
async function testBackendConnection(ip, port) {
  try {
    const { execSync } = require('child_process');
    
    // Use PowerShell Test-NetConnection on Windows
    if (process.platform === 'win32') {
      const result = execSync(`powershell "Test-NetConnection -ComputerName ${ip} -Port ${port} -InformationLevel Quiet"`, 
        { encoding: 'utf8', timeout: 5000 });
      return result.trim() === 'True';
    }
    
    // For other platforms, try a simple TCP connection test
    const net = require('net');
    return new Promise((resolve) => {
      const socket = new net.Socket();
      const timeout = setTimeout(() => {
        socket.destroy();
        resolve(false);
      }, 3000);
      
      socket.connect(port, ip, () => {
        clearTimeout(timeout);
        socket.destroy();
        resolve(true);
      });
      
      socket.on('error', () => {
        clearTimeout(timeout);
        resolve(false);
      });
    });
    
  } catch (error) {
    return false;
  }
}

/**
 * Main function to detect and update WiFi IP
 */
async function detectAndUpdateWiFiIP(port = DEFAULT_PORT) {
  log('\n🔍 Auto WiFi IP Detection Started', 'cyan');
  log('=====================================', 'cyan');
  
  // Get current WiFi IP
  const currentIP = getWiFiIPAddress();
  if (!currentIP) {
    logError('Could not detect WiFi IP address');
    return false;
  }
  
  logInfo(`Detected WiFi IP: ${currentIP}`);
  
  // Read current env.js configuration
  const envContent = readEnvFile();
  if (!envContent) return false;
  
  const currentConfig = getCurrentIPFromEnv(envContent);
  if (currentConfig) {
    logInfo(`Current env.js IP: ${currentConfig.ip}:${currentConfig.port}`);
    
    if (currentConfig.ip === currentIP && currentConfig.port === port) {
      logInfo('IP address is already up to date');
      return true;
    }
  }
  
  // Test backend connection
  logInfo(`Testing backend connection on ${currentIP}:${port}...`);
  const isBackendAccessible = await testBackendConnection(currentIP, port);
  
  if (!isBackendAccessible) {
    logWarning(`Backend is not accessible on ${currentIP}:${port}`);
    logWarning('Make sure your backend server is running');
    logWarning('You can still update the configuration and start the backend later');
  } else {
    logSuccess(`Backend is accessible on ${currentIP}:${port}`);
  }
  
  // Update env.js file
  const updateSuccess = updateEnvFile(currentIP, port);
  
  if (updateSuccess) {
    logSuccess('Configuration updated successfully!');
    logInfo('Remember to restart your mobile app to pick up the new configuration');
    return true;
  }
  
  return false;
}

/**
 * Watch mode - continuously monitor for IP changes
 */
async function watchMode(port = DEFAULT_PORT) {
  log('\n👀 Starting WiFi IP Watch Mode', 'magenta');
  log('Press Ctrl+C to stop watching', 'yellow');
  log('=====================================', 'magenta');
  
  let lastIP = null;
  
  const checkIP = async () => {
    const currentIP = getWiFiIPAddress();
    
    if (currentIP && currentIP !== lastIP) {
      log(`\n🔄 IP Change Detected: ${lastIP || 'unknown'} → ${currentIP}`, 'yellow');
      await detectAndUpdateWiFiIP(port);
      lastIP = currentIP;
    }
  };
  
  // Initial check
  await checkIP();
  
  // Set up interval
  const interval = setInterval(checkIP, WATCH_INTERVAL);
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    log('\n\n👋 Stopping WiFi IP watch mode...', 'yellow');
    clearInterval(interval);
    process.exit(0);
  });
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);
  
  // Parse arguments
  let port = DEFAULT_PORT;
  let watchModeEnabled = false;
  
  for (const arg of args) {
    if (arg === '--watch' || arg === '-w') {
      watchModeEnabled = true;
    } else if (/^\d+$/.test(arg)) {
      port = arg;
    } else if (arg === '--help' || arg === '-h') {
      console.log(`
Usage: node auto-update-wifi-ip.js [options] [port]

Options:
  --watch, -w    Run in watch mode (continuously monitor for IP changes)
  --help, -h     Show this help message

Arguments:
  port           Backend port number (default: ${DEFAULT_PORT})

Examples:
  node auto-update-wifi-ip.js                    # Update once with default port
  node auto-update-wifi-ip.js 5001              # Update once with port 5001
  node auto-update-wifi-ip.js --watch           # Watch mode with default port
  node auto-update-wifi-ip.js --watch 5001      # Watch mode with port 5001
`);
      return;
    }
  }
  
  if (watchModeEnabled) {
    await watchMode(port);
  } else {
    await detectAndUpdateWiFiIP(port);
  }
}

// Run the script
if (require.main === module) {
  main().catch(error => {
    logError(`Script failed: ${error.message}`);
    process.exit(1);
  });
}

module.exports = {
  detectAndUpdateWiFiIP,
  getWiFiIPAddress,
  updateEnvFile
};