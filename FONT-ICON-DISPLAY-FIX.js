// Font and Icon Display Fix Script
const fs = require('fs');
const path = require('path');

console.log('🔍 Diagnosing font and icon display issues...\n');

// Check if fonts are properly loaded
const appJsPath = path.join(__dirname, 'app', 'App.js');
const appContent = fs.readFileSync(appJsPath, 'utf8');

console.log('📋 DIAGNOSIS RESULTS:');
console.log('===================');

// 1. Check font loading
if (appContent.includes('Font.loadAsync') || appContent.includes('expo-font')) {
  console.log('✅ Font loading detected');
} else {
  console.log('⚠️  No custom font loading found - using system fonts only');
}

// 2. Check icon imports
if (appContent.includes('@expo/vector-icons')) {
  console.log('✅ @expo/vector-icons imported');
} else {
  console.log('❌ @expo/vector-icons not imported in App.js');
}

// 3. Check package.json for dependencies
const packageJsonPath = path.join(__dirname, 'app', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

const requiredDeps = [
  '@expo/vector-icons',
  'expo-font',
  'react-native-vector-icons'
];

console.log('\n📦 DEPENDENCY CHECK:');
requiredDeps.forEach(dep => {
  if (packageJson.dependencies[dep]) {
    console.log(`✅ ${dep}: ${packageJson.dependencies[dep]}`);
  } else {
    console.log(`❌ ${dep}: MISSING`);
  }
});

// 4. Check for common issues
console.log('\n🔧 COMMON ISSUES TO CHECK:');
console.log('1. Metro bundler cache - run: npx expo start --clear');
console.log('2. Font files missing - check assets/fonts/ directory');
console.log('3. Icon names incorrect - verify Ionicons names');
console.log('4. Platform-specific rendering - test on actual device');
console.log('5. Text scaling issues - check accessibility settings');

console.log('\n🚀 RECOMMENDED FIXES:');
console.log('1. Clear cache and restart');
console.log('2. Add font loading if needed');
console.log('3. Fix text rendering props');
console.log('4. Add error boundaries for images');