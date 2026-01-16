/**
 * Android UI Regression Fix Verification Script
 * 
 * This script checks that all Android UI regression issues have been properly fixed:
 * - No excessive elevation values (>2 for Android)
 * - No overflow: 'hidden' with elevation combinations
 * - No rgba() backgrounds that cause fogginess
 * - Consistent solid white backgrounds
 * - Platform-specific optimizations
 */

const fs = require('fs');
const path = require('path');

// Files to check for Android UI issues
const filesToCheck = [
  'app/components/SearchInput.js',
  'app/components/AndroidSafeCard.js',
  'app/components/Card.js',
  'app/components/UnifiedCard.js',
  'app/screens/ReportPotholeScreen.js',
  'app/screens/RoadStatusScreen.js',
  'app/screens/MyReportsScreen.js',
  'app/screens/SettingsScreen.js',
  'app/screens/HomeScreen.js',
  'app/theme/shadows.js',
];

// Patterns that indicate potential Android UI issues
const problematicPatterns = [
  {
    pattern: /elevation:\s*[4-9]|elevation:\s*[1-9][0-9]/g,
    issue: 'Excessive elevation (>3) - causes Android fogginess',
    severity: 'CRITICAL',
  },
  {
    pattern: /elevation:\s*[3]/g,
    issue: 'Elevation of 3 - at Android limit, consider reducing to 2',
    severity: 'WARNING',
  },
  {
    pattern: /overflow:\s*['"']hidden['"'].*elevation:|elevation:.*overflow:\s*['"']hidden['"']/g,
    issue: 'overflow: hidden with elevation - causes Android clipping',
    severity: 'HIGH',
  },
  {
    pattern: /backgroundColor:\s*['"']rgba\([^)]+\)['"']/g,
    issue: 'rgba() background - causes Android fogginess',
    severity: 'HIGH',
  },
  {
    pattern: /shadowOpacity:\s*0\.[3-9]|shadowOpacity:\s*[1-9]/g,
    issue: 'High shadow opacity - may cause heavy shadows on Android',
    severity: 'MEDIUM',
  },
  {
    pattern: /shadowRadius:\s*[8-9]|shadowRadius:\s*[1-9][0-9]/g,
    issue: 'Large shadow radius - may cause performance issues',
    severity: 'MEDIUM',
  },
];

// Good patterns that indicate proper Android-safe styling
const goodPatterns = [
  {
    pattern: /Platform\.select\(/g,
    description: 'Platform-specific styling',
  },
  {
    pattern: /backgroundColor:\s*['"']#FFFFFF['"']/g,
    description: 'Solid white background',
  },
  {
    pattern: /borderWidth:\s*1/g,
    description: 'Border fallback for elevation',
  },
  {
    pattern: /elevation:\s*[0-2](?![0-9])/g,
    description: 'Android-safe elevation (0-2)',
  },
];

function analyzeFile(filePath) {
  const fullPath = path.join(__dirname, filePath);
  
  if (!fs.existsSync(fullPath)) {
    return {
      file: filePath,
      status: 'FILE_NOT_FOUND',
      issues: [],
      goodPractices: [],
    };
  }

  const content = fs.readFileSync(fullPath, 'utf8');
  const issues = [];
  const goodPractices = [];

  // Check for problematic patterns
  problematicPatterns.forEach(({ pattern, issue, severity }) => {
    const matches = content.match(pattern);
    if (matches) {
      matches.forEach(match => {
        const lineNumber = content.substring(0, content.indexOf(match)).split('\n').length;
        issues.push({
          severity,
          issue,
          match: match.trim(),
          line: lineNumber,
        });
      });
    }
  });

  // Check for good patterns
  goodPatterns.forEach(({ pattern, description }) => {
    const matches = content.match(pattern);
    if (matches) {
      goodPractices.push({
        description,
        count: matches.length,
      });
    }
  });

  return {
    file: filePath,
    status: issues.length === 0 ? 'CLEAN' : 'ISSUES_FOUND',
    issues,
    goodPractices,
  };
}

function generateReport() {
  console.log('🔍 Android UI Regression Fix Verification\n');
  console.log('=' .repeat(60));
  
  const results = filesToCheck.map(analyzeFile);
  
  let totalIssues = 0;
  let criticalIssues = 0;
  let highIssues = 0;
  let warningIssues = 0;
  let cleanFiles = 0;

  results.forEach(result => {
    const { file, status, issues, goodPractices } = result;
    
    console.log(`\n📁 ${file}`);
    console.log('-'.repeat(40));
    
    if (status === 'FILE_NOT_FOUND') {
      console.log('❓ File not found');
      return;
    }
    
    if (status === 'CLEAN') {
      console.log('✅ CLEAN - No Android UI issues found');
      cleanFiles++;
    } else {
      console.log(`❌ ISSUES FOUND (${issues.length})`);
      
      issues.forEach(issue => {
        const icon = {
          CRITICAL: '🔴',
          HIGH: '🟠',
          WARNING: '🟡',
          MEDIUM: '🔵',
        }[issue.severity] || '⚪';
        
        console.log(`   ${icon} ${issue.severity}: ${issue.issue}`);
        console.log(`      Line ${issue.line}: ${issue.match}`);
        
        totalIssues++;
        if (issue.severity === 'CRITICAL') criticalIssues++;
        if (issue.severity === 'HIGH') highIssues++;
        if (issue.severity === 'WARNING') warningIssues++;
      });
    }
    
    if (goodPractices.length > 0) {
      console.log('\n   ✅ Good practices found:');
      goodPractices.forEach(practice => {
        console.log(`      • ${practice.description} (${practice.count}x)`);
      });
    }
  });

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 SUMMARY');
  console.log('='.repeat(60));
  
  console.log(`📁 Files analyzed: ${filesToCheck.length}`);
  console.log(`✅ Clean files: ${cleanFiles}`);
  console.log(`❌ Files with issues: ${results.filter(r => r.status === 'ISSUES_FOUND').length}`);
  console.log(`🔍 Total issues found: ${totalIssues}`);
  
  if (totalIssues > 0) {
    console.log('\n🚨 Issues by severity:');
    if (criticalIssues > 0) console.log(`   🔴 Critical: ${criticalIssues}`);
    if (highIssues > 0) console.log(`   🟠 High: ${highIssues}`);
    if (warningIssues > 0) console.log(`   🟡 Warning: ${warningIssues}`);
  }

  // Recommendations
  console.log('\n💡 RECOMMENDATIONS');
  console.log('='.repeat(60));
  
  if (criticalIssues > 0) {
    console.log('🔴 CRITICAL ISSUES FOUND:');
    console.log('   • Fix excessive elevation values (reduce to max 2 for Android)');
    console.log('   • Replace rgba() backgrounds with solid colors + opacity');
    console.log('   • Remove overflow: hidden from elevated components');
  }
  
  if (totalIssues === 0) {
    console.log('🎉 ALL ANDROID UI REGRESSION ISSUES HAVE BEEN FIXED!');
    console.log('✅ Your app should now render cleanly on Android devices');
    console.log('✅ No more foggy, double-layered, or clipped components');
    console.log('✅ Professional bank-grade styling implemented');
  } else {
    console.log('⚠️  Some issues remain. Please address them for optimal Android rendering.');
  }

  console.log('\n🧪 TESTING CHECKLIST');
  console.log('='.repeat(60));
  console.log('□ Test on physical Android device (not just emulator)');
  console.log('□ Check cards appear crisp and clean (not foggy)');
  console.log('□ Verify no double-layered appearance');
  console.log('□ Confirm search bars look professional');
  console.log('□ Test severity selection in road damage report');
  console.log('□ Check road status page map controls');
  console.log('□ Verify my reports screen cards');
  console.log('□ Test settings screen profile card');
  console.log('□ Check navigation components');

  return {
    totalFiles: filesToCheck.length,
    cleanFiles,
    totalIssues,
    criticalIssues,
    highIssues,
    warningIssues,
    success: totalIssues === 0,
  };
}

// Run the analysis
if (require.main === module) {
  const report = generateReport();
  process.exit(report.success ? 0 : 1);
}

module.exports = { analyzeFile, generateReport };