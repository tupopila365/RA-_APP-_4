// Text Rendering Fix for Display Issues
const fs = require('fs');
const path = require('path');

console.log('🔧 Applying text rendering fixes...\n');

// Function to add maxFontSizeMultiplier to Text components
function fixTextComponents(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`❌ File not found: ${filePath}`);
    return false;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Add maxFontSizeMultiplier to Text components that don't have it
  const textRegex = /<Text\s+([^>]*?)>/g;
  content = content.replace(textRegex, (match, props) => {
    if (!props.includes('maxFontSizeMultiplier')) {
      modified = true;
      // Add maxFontSizeMultiplier before the last prop
      return `<Text ${props} maxFontSizeMultiplier={1.3}>`;
    }
    return match;
  });

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed text rendering in: ${path.basename(filePath)}`);
    return true;
  }

  return false;
}

// Files to fix
const filesToFix = [
  path.join(__dirname, 'app', 'screens', 'ChatbotScreen.js'),
  path.join(__dirname, 'app', 'screens', 'HomeScreen.js'),
  path.join(__dirname, 'app', 'screens', 'NewsScreen.js'),
  path.join(__dirname, 'app', 'screens', 'VacanciesScreen.js'),
  path.join(__dirname, 'app', 'screens', 'FindOfficesScreen.js'),
];

console.log('📝 Fixing text rendering in key components...');
let totalFixed = 0;

filesToFix.forEach(file => {
  if (fixTextComponents(file)) {
    totalFixed++;
  }
});

console.log(`\n✅ Fixed ${totalFixed} files`);

// Create a utility component for consistent text rendering
const textUtilityContent = `import React from 'react';
import { Text as RNText } from 'react-native';

// Enhanced Text component with consistent rendering props
export function Text({ children, style, allowFontScaling = true, maxFontSizeMultiplier = 1.3, ...props }) {
  return (
    <RNText
      style={style}
      allowFontScaling={allowFontScaling}
      maxFontSizeMultiplier={maxFontSizeMultiplier}
      {...props}
    >
      {children}
    </RNText>
  );
}

// Text variants for consistent typography
export function HeadingText({ children, style, ...props }) {
  return (
    <Text
      style={[{ fontSize: 24, fontWeight: 'bold' }, style]}
      maxFontSizeMultiplier={1.2}
      {...props}
    >
      {children}
    </Text>
  );
}

export function BodyText({ children, style, ...props }) {
  return (
    <Text
      style={[{ fontSize: 16, lineHeight: 24 }, style]}
      {...props}
    >
      {children}
    </Text>
  );
}

export function CaptionText({ children, style, ...props }) {
  return (
    <Text
      style={[{ fontSize: 12, opacity: 0.7 }, style]}
      {...props}
    >
      {children}
    </Text>
  );
}
`;

const textUtilityPath = path.join(__dirname, 'app', 'components', 'Text.js');
fs.writeFileSync(textUtilityPath, textUtilityContent, 'utf8');
console.log('✅ Created enhanced Text component utility');

console.log('\n🎯 TEXT RENDERING FIXES APPLIED:');
console.log('1. Added maxFontSizeMultiplier to prevent text overflow');
console.log('2. Created enhanced Text component utility');
console.log('3. Set consistent font scaling limits');
console.log('\n🚀 Next: Clear cache and restart the app');