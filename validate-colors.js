#!/usr/bin/env node

/**
 * COLOR VALIDATION SCRIPT
 * 
 * This script scans the entire codebase for hardcoded colors and validates
 * that all colors follow the official government design system.
 */

const fs = require('fs');
const path = require('path');

// Official government colors that are allowed
const ALLOWED_COLORS = {
  // Brand colors
  '#00B4E6': 'Primary (Government Blue)',
  '#33C4ED': 'Primary Light',
  '#0099CC': 'Primary Dark',
  '#FFD700': 'Secondary (Namibian Gold)',
  '#FFDF33': 'Secondary Light',
  '#E6C200': 'Secondary Dark',
  '#0EA5E9': 'Accent',
  
  // Status colors
  '#059669': 'Success',
  '#10B981': 'Success Light',
  '#047857': 'Success Dark',
  '#D97706': 'Warning',
  '#F59E0B': 'Warning Light',
  '#B45309': 'Warning Dark',
  '#DC2626': 'Error',
  '#EF4444': 'Error Light',
  '#B91C1C': 'Error Dark',
  '#0284C7': 'Info',
  '#0EA5E9': 'Info Light',
  '#0369A1': 'Info Dark',
  
  // Neutral colors
  '#FFFFFF': 'White',
  '#F8FAFC': 'Gray 50',
  '#F1F5F9': 'Gray 100',
  '#E2E8F0': 'Gray 200',
  '#CBD5E1': 'Gray 300',
  '#94A3B8': 'Gray 400',
  '#64748B': 'Gray 500',
  '#475569': 'Gray 600',
  '#334155': 'Gray 700',
  '#1E293B': 'Gray 800',
  '#0F172A': 'Gray 900',
  '#000000': 'Black',
  
  // Special cases (transparent, rgba, etc.)
  'transparent': 'Transparent',
  '#000': 'Black (short)',
  '#FFF': 'White (short)',
};

// Colors that should be replaced
const DEPRECATED_COLORS = {
  '#1976D2': 'Material Design Blue - Replace with #00B4E6',
  '#2563EB': 'Wrong Blue - Replace with #00B4E6',
  '#4CAF50': 'Material Green - Replace with #059669',
  '#F44336': 'Material Red - Replace with #DC2626',
  '#FF9800': 'Material Orange - Replace with #D97706',
  '#9C27B0': 'Material Purple - Replace with semantic color',
  '#E91E63': 'Material Pink - Replace with semantic color',
  '#00BCD4': 'Material Cyan - Replace with #00B4E6',
  '#3F51B5': 'Material Indigo - Replace with #00B4E6',
  '#607D8B': 'Material Blue Grey - Replace with neutral gray',
  '#795548': 'Material Brown - Replace with neutral gray',
  '#FF5722': 'Material Deep Orange - Replace with #DC2626',
  '#8BC34A': 'Material Light Green - Replace with #059669',
  '#CDDC39': 'Material Lime - Replace with #D97706',
  '#FFEB3B': 'Material Yellow - Replace with #FFD700',
  '#FFC107': 'Material Amber - Replace with #D97706',
  '#FF6B6B': 'Custom Red - Replace with #DC2626',
  '#4ECDC4': 'Custom Teal - Replace with #00B4E6',
  '#45B7D1': 'Custom Blue - Replace with #00B4E6',
  '#96CEB4': 'Custom Green - Replace with #059669',
  '#FFEAA7': 'Custom Yellow - Replace with #FFD700',
  '#DDA0DD': 'Custom Purple - Replace with semantic color',
  '#98D8C8': 'Custom Mint - Replace with #059669',
  '#F7DC6F': 'Custom Gold - Replace with #FFD700',
  '#BB8FCE': 'Custom Lavender - Replace with semantic color',
  '#85C1E9': 'Custom Sky Blue - Replace with #00B4E6',
};

// File extensions to scan
const SCAN_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx', '.css', '.scss', '.json'];

// Directories to scan
const SCAN_DIRECTORIES = ['app', 'admin/src', 'backend/src'];

// Directories to ignore
const IGNORE_DIRECTORIES = ['node_modules', '.git', 'build', 'dist', '.expo'];

// Color regex patterns
const COLOR_PATTERNS = [
  /#[0-9A-Fa-f]{6}/g,  // 6-digit hex
  /#[0-9A-Fa-f]{3}/g,   // 3-digit hex
  /rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)/g,  // rgb()
  /rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)/g,  // rgba()
];

let totalFiles = 0;
let filesWithIssues = 0;
let totalIssues = 0;
let issuesByType = {
  deprecated: 0,
  unknown: 0,
  hardcoded: 0,
};

function scanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const issues = [];
    
    // Find all color matches
    const allMatches = [];
    COLOR_PATTERNS.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        allMatches.push(...matches);
      }
    });
    
    // Remove duplicates
    const uniqueColors = [...new Set(allMatches)];
    
    uniqueColors.forEach(color => {
      const upperColor = color.toUpperCase();
      
      // Check if it's a deprecated color
      if (DEPRECATED_COLORS[upperColor]) {
        issues.push({
          type: 'deprecated',
          color: color,
          message: DEPRECATED_COLORS[upperColor],
          severity: 'high'
        });
        issuesByType.deprecated++;
      }
      // Check if it's an unknown color (not in allowed list)
      else if (!ALLOWED_COLORS[upperColor] && !color.includes('rgba') && !color.includes('rgb')) {
        issues.push({
          type: 'unknown',
          color: color,
          message: 'Unknown color - should be added to theme or replaced',
          severity: 'medium'
        });
        issuesByType.unknown++;
      }
      // Check if it's hardcoded (should use theme variable)
      else if (ALLOWED_COLORS[upperColor] && !filePath.includes('theme/') && !filePath.includes('governmentColors')) {
        issues.push({
          type: 'hardcoded',
          color: color,
          message: `Hardcoded color - use theme variable instead`,
          severity: 'low'
        });
        issuesByType.hardcoded++;
      }
    });
    
    if (issues.length > 0) {
      filesWithIssues++;
      totalIssues += issues.length;
      
      console.log(`\n📄 ${filePath}`);
      issues.forEach(issue => {
        const emoji = issue.severity === 'high' ? '🔴' : issue.severity === 'medium' ? '🟡' : '🔵';
        console.log(`  ${emoji} ${issue.color} - ${issue.message}`);
      });
    }
    
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error.message);
  }
}

function scanDirectory(dirPath) {
  try {
    const items = fs.readdirSync(dirPath);
    
    items.forEach(item => {
      const itemPath = path.join(dirPath, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory()) {
        // Skip ignored directories
        if (!IGNORE_DIRECTORIES.includes(item)) {
          scanDirectory(itemPath);
        }
      } else if (stat.isFile()) {
        // Check if file extension should be scanned
        const ext = path.extname(item);
        if (SCAN_EXTENSIONS.includes(ext)) {
          totalFiles++;
          scanFile(itemPath);
        }
      }
    });
  } catch (error) {
    console.error(`Error scanning directory ${dirPath}:`, error.message);
  }
}

function printSummary() {
  console.log('\n' + '='.repeat(60));
  console.log('🎨 COLOR VALIDATION SUMMARY');
  console.log('='.repeat(60));
  
  console.log(`📊 Files scanned: ${totalFiles}`);
  console.log(`⚠️  Files with issues: ${filesWithIssues}`);
  console.log(`🚨 Total issues: ${totalIssues}`);
  
  console.log('\n📈 Issues by type:');
  console.log(`  🔴 Deprecated colors: ${issuesByType.deprecated} (HIGH PRIORITY)`);
  console.log(`  🟡 Unknown colors: ${issuesByType.unknown} (MEDIUM PRIORITY)`);
  console.log(`  🔵 Hardcoded colors: ${issuesByType.hardcoded} (LOW PRIORITY)`);
  
  if (totalIssues === 0) {
    console.log('\n✅ EXCELLENT! No color issues found.');
    console.log('   Your app follows the government design system perfectly.');
  } else {
    console.log('\n🎯 NEXT STEPS:');
    console.log('   1. Fix deprecated colors (🔴) first - these break consistency');
    console.log('   2. Review unknown colors (🟡) - add to theme or replace');
    console.log('   3. Replace hardcoded colors (🔵) with theme variables');
    console.log('\n📖 See GOVERNMENT-DESIGN-SYSTEM.md for color guidelines');
  }
  
  console.log('\n' + '='.repeat(60));
}

function printHeader() {
  console.log('🎨 GOVERNMENT COLOR SYSTEM VALIDATOR');
  console.log('Scanning for color inconsistencies...\n');
}

// Main execution
function main() {
  printHeader();
  
  // Scan each directory
  SCAN_DIRECTORIES.forEach(dir => {
    if (fs.existsSync(dir)) {
      console.log(`🔍 Scanning ${dir}/...`);
      scanDirectory(dir);
    } else {
      console.log(`⚠️  Directory ${dir}/ not found, skipping...`);
    }
  });
  
  printSummary();
  
  // Exit with error code if issues found
  process.exit(totalIssues > 0 ? 1 : 0);
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  scanFile,
  scanDirectory,
  ALLOWED_COLORS,
  DEPRECATED_COLORS,
};