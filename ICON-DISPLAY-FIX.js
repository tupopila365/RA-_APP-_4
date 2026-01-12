// Icon Display Fix Script
const fs = require('fs');
const path = require('path');

console.log('🎯 Fixing icon display issues...\n');

// Common Ionicons names that might be causing issues
const problematicIcons = [
  'ios-', 'md-', // Old naming convention
  'logo-', // Logo icons that might not exist
];

const validIconReplacements = {
  'ios-home': 'home',
  'md-home': 'home',
  'ios-settings': 'settings',
  'md-settings': 'settings',
  'ios-notifications': 'notifications',
  'md-notifications': 'notifications',
  'ios-chatbubbles': 'chatbubbles',
  'md-chatbubbles': 'chatbubbles',
  'ios-newspaper': 'newspaper',
  'md-newspaper': 'newspaper',
  'logo-whatsapp': 'logo-whatsapp', // This one is valid
  'logo-facebook': 'logo-facebook', // This one is valid
};

function fixIconNames(filePath) {
  if (!fs.existsSync(filePath)) {
    return false;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Fix icon names
  Object.entries(validIconReplacements).forEach(([oldName, newName]) => {
    const regex = new RegExp(`name=["']${oldName}["']`, 'g');
    if (content.includes(oldName)) {
      content = content.replace(regex, `name="${newName}"`);
      modified = true;
      console.log(`  ✅ Fixed icon: ${oldName} → ${newName}`);
    }
  });

  // Check for potentially invalid icon names
  const iconRegex = /name=["']([^"']+)["']/g;
  let match;
  while ((match = iconRegex.exec(content)) !== null) {
    const iconName = match[1];
    if (problematicIcons.some(prefix => iconName.startsWith(prefix)) && 
        !validIconReplacements[iconName]) {
      console.log(`  ⚠️  Potentially invalid icon: ${iconName} in ${path.basename(filePath)}`);
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  }

  return false;
}

// Files to check for icon issues
const filesToCheck = [
  path.join(__dirname, 'app', 'App.js'),
  path.join(__dirname, 'app', 'screens', 'ChatbotScreen.js'),
  path.join(__dirname, 'app', 'screens', 'HomeScreen.js'),
  path.join(__dirname, 'app', 'screens', 'NewsScreen.js'),
  path.join(__dirname, 'app', 'screens', 'VacanciesScreen.js'),
  path.join(__dirname, 'app', 'screens', 'FindOfficesScreen.js'),
  path.join(__dirname, 'app', 'screens', 'SettingsScreen.js'),
  path.join(__dirname, 'app', 'components', 'IconContainer.js'),
];

console.log('🔍 Checking icon names in components...');
let totalFixed = 0;

filesToCheck.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`\nChecking: ${path.basename(file)}`);
    if (fixIconNames(file)) {
      totalFixed++;
    }
  }
});

console.log(`\n✅ Fixed icon names in ${totalFixed} files`);

// Create icon validation utility
const iconValidatorContent = `// Icon Validator Utility
import { Ionicons } from '@expo/vector-icons';

// List of commonly used valid Ionicons
export const VALID_ICONS = {
  // Navigation
  home: 'home',
  homeOutline: 'home-outline',
  settings: 'settings',
  settingsOutline: 'settings-outline',
  
  // Communication
  chatbubbles: 'chatbubbles',
  chatbubblesOutline: 'chatbubbles-outline',
  notifications: 'notifications',
  notificationsOutline: 'notifications-outline',
  
  // Content
  newspaper: 'newspaper',
  newspaperOutline: 'newspaper-outline',
  document: 'document',
  documentOutline: 'document-outline',
  
  // Actions
  add: 'add',
  addOutline: 'add-outline',
  close: 'close',
  closeOutline: 'close-outline',
  refresh: 'refresh',
  refreshOutline: 'refresh-outline',
  
  // Arrows
  chevronForward: 'chevron-forward',
  chevronBack: 'chevron-back',
  chevronDown: 'chevron-down',
  chevronUp: 'chevron-up',
  
  // Status
  checkmark: 'checkmark',
  checkmarkCircle: 'checkmark-circle',
  alert: 'alert',
  alertCircle: 'alert-circle',
  
  // Maps & Location
  map: 'map',
  mapOutline: 'map-outline',
  location: 'location',
  locationOutline: 'location-outline',
  
  // Vehicles
  car: 'car',
  carOutline: 'car-outline',
  
  // Common UI
  search: 'search',
  searchOutline: 'search-outline',
  filter: 'filter',
  filterOutline: 'filter-outline',
  menu: 'menu',
  menuOutline: 'menu-outline',
};

// Validate if an icon name exists
export function validateIcon(iconName) {
  return Object.values(VALID_ICONS).includes(iconName);
}

// Get a safe icon name (fallback to default if invalid)
export function getSafeIconName(iconName, fallback = 'ellipse-outline') {
  return validateIcon(iconName) ? iconName : fallback;
}

// Enhanced Icon component with validation
export function SafeIcon({ name, size = 24, color = '#000', style, ...props }) {
  const safeName = getSafeIconName(name);
  
  if (safeName !== name) {
    console.warn(\`Invalid icon name: \${name}, using fallback: \${safeName}\`);
  }
  
  return (
    <Ionicons 
      name={safeName} 
      size={size} 
      color={color} 
      style={style}
      {...props}
    />
  );
}
`;

const iconValidatorPath = path.join(__dirname, 'app', 'utils', 'iconValidator.js');
const utilsDir = path.dirname(iconValidatorPath);
if (!fs.existsSync(utilsDir)) {
  fs.mkdirSync(utilsDir, { recursive: true });
}
fs.writeFileSync(iconValidatorPath, iconValidatorContent, 'utf8');
console.log('✅ Created icon validator utility');

console.log('\n🎯 ICON FIXES APPLIED:');
console.log('1. Fixed deprecated icon names');
console.log('2. Created icon validator utility');
console.log('3. Added SafeIcon component for error handling');
console.log('\n⚠️  COMMON ICON ISSUES:');
console.log('- Using old ios-/md- prefixes');
console.log('- Typos in icon names');
console.log('- Using non-existent logo icons');
console.log('\n🚀 Next: Test icons on actual device');