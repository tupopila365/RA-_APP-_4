// Test script to verify expo-document-picker installation
const fs = require('fs');
const path = require('path');

console.log('🔍 Testing expo-document-picker installation...\n');

// Check if package is in node_modules
const appDir = path.join(__dirname, 'app');
const nodeModulesPath = path.join(appDir, 'node_modules', 'expo-document-picker');

console.log('1. Checking node_modules...');
if (fs.existsSync(nodeModulesPath)) {
  console.log('✅ expo-document-picker found in node_modules');
  
  // Check package.json
  const packageJsonPath = path.join(nodeModulesPath, 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    console.log(`   Version: ${packageJson.version}`);
  }
} else {
  console.log('❌ expo-document-picker NOT found in node_modules');
}

// Check if it's in package.json dependencies
console.log('\n2. Checking package.json dependencies...');
const appPackageJsonPath = path.join(appDir, 'package.json');
if (fs.existsSync(appPackageJsonPath)) {
  const appPackageJson = JSON.parse(fs.readFileSync(appPackageJsonPath, 'utf8'));
  const deps = appPackageJson.dependencies || {};
  
  if (deps['expo-document-picker']) {
    console.log(`✅ expo-document-picker in dependencies: ${deps['expo-document-picker']}`);
  } else {
    console.log('❌ expo-document-picker NOT in dependencies');
  }
} else {
  console.log('❌ package.json not found');
}

// Try to require the module
console.log('\n3. Testing module import...');
try {
  process.chdir(appDir);
  const DocumentPicker = require('expo-document-picker');
  console.log('✅ Module can be required');
  console.log('   Available methods:', Object.keys(DocumentPicker));
  
  if (DocumentPicker.getDocumentAsync) {
    console.log('✅ getDocumentAsync method available');
  } else {
    console.log('❌ getDocumentAsync method NOT available');
  }
} catch (error) {
  console.log('❌ Module import failed:', error.message);
}

console.log('\n🔧 Recommendations:');
console.log('If any checks failed, run:');
console.log('  cd app');
console.log('  npm uninstall expo-document-picker');
console.log('  npx expo install expo-document-picker');
console.log('  npx expo start --clear');