// Test script to verify ChatbotScreen fixes
const fs = require('fs');
const path = require('path');

console.log('Testing ChatbotScreen fixes...');

// Check if AsyncStorage import is correct
const chatbotScreenPath = path.join(__dirname, 'app', 'screens', 'ChatbotScreen.js');
const content = fs.readFileSync(chatbotScreenPath, 'utf8');

// Check for AsyncStorage import
if (content.includes("import AsyncStorage from '@react-native-async-storage/async-storage'")) {
  console.log('✅ AsyncStorage import found');
} else {
  console.log('❌ AsyncStorage import missing');
}

// Check for SecureStore removal
if (!content.includes('import * as SecureStore')) {
  console.log('✅ SecureStore import removed');
} else {
  console.log('❌ SecureStore import still present');
}

// Check for AsyncStorage usage
if (content.includes('AsyncStorage.getItem') && content.includes('AsyncStorage.setItem')) {
  console.log('✅ AsyncStorage methods used correctly');
} else {
  console.log('❌ AsyncStorage methods not found');
}

// Check package.json for AsyncStorage dependency
const packageJsonPath = path.join(__dirname, 'app', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

if (packageJson.dependencies['@react-native-async-storage/async-storage']) {
  console.log('✅ AsyncStorage dependency added to package.json');
} else {
  console.log('❌ AsyncStorage dependency missing from package.json');
}

console.log('\nFix Summary:');
console.log('- Replaced expo-secure-store with @react-native-async-storage/async-storage');
console.log('- Updated all storage methods to use AsyncStorage');
console.log('- Added missing props to MessageItem component');
console.log('- This should resolve the ExpoCrypto runtime error');

console.log('\nNext steps:');
console.log('1. Run: cd app && npm install');
console.log('2. Clear cache: npx expo start --clear');
console.log('3. Test the ChatbotScreen functionality');