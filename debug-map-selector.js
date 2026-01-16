/**
 * Debug Map Selector Issue
 * 
 * This script helps debug why the "Show Map" button might not be working
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Debugging Map Selector Issue...\n');

// Check if the RoadStatusForm has the correct button implementation
const formPath = path.join(__dirname, 'admin/src/pages/RoadStatus/RoadStatusForm.tsx');
if (fs.existsSync(formPath)) {
  const formContent = fs.readFileSync(formPath, 'utf8');
  
  console.log('📋 Checking RoadStatusForm.tsx:\n');
  
  // Check for showMapSelector state
  if (formContent.includes('const [showMapSelector, setShowMapSelector] = useState(false)')) {
    console.log('✅ showMapSelector state declared correctly');
  } else {
    console.log('❌ showMapSelector state not found or incorrect');
  }
  
  // Check for button click handler
  if (formContent.includes('onClick={() => setShowMapSelector(!showMapSelector)}')) {
    console.log('✅ Button click handler implemented');
  } else {
    console.log('❌ Button click handler missing or incorrect');
  }
  
  // Check for conditional rendering
  if (formContent.includes('{showMapSelector && (')) {
    console.log('✅ Conditional map rendering implemented');
  } else {
    console.log('❌ Conditional map rendering missing');
  }
  
  // Check for MapLocationSelector import
  if (formContent.includes("import MapLocationSelector from '../../components/MapLocationSelector'")) {
    console.log('✅ MapLocationSelector imported correctly');
  } else {
    console.log('❌ MapLocationSelector import missing or incorrect');
  }
  
  // Check for MapLocationSelector usage
  if (formContent.includes('<MapLocationSelector')) {
    console.log('✅ MapLocationSelector component used');
  } else {
    console.log('❌ MapLocationSelector component not used');
  }
}

// Check MapLocationSelector component
const mapSelectorPath = path.join(__dirname, 'admin/src/components/MapLocationSelector.tsx');
if (fs.existsSync(mapSelectorPath)) {
  const mapContent = fs.readFileSync(mapSelectorPath, 'utf8');
  
  console.log('\n📋 Checking MapLocationSelector.tsx:\n');
  
  // Check for React hooks before conditional return
  const hooksBeforeReturn = mapContent.indexOf('useState') < mapContent.indexOf('if (!hasGoogleMapsKey)');
  if (hooksBeforeReturn) {
    console.log('✅ React hooks declared before conditional return');
  } else {
    console.log('❌ React hooks declared after conditional return (this will cause errors)');
  }
  
  // Check for export
  if (mapContent.includes('export default MapLocationSelector')) {
    console.log('✅ MapLocationSelector exported correctly');
  } else {
    console.log('❌ MapLocationSelector export missing');
  }
}

// Check fallback component
const fallbackPath = path.join(__dirname, 'admin/src/components/MapLocationSelectorFallback.tsx');
if (fs.existsSync(fallbackPath)) {
  console.log('✅ MapLocationSelectorFallback component exists');
} else {
  console.log('❌ MapLocationSelectorFallback component missing');
}

console.log('\n🔧 Common Issues and Solutions:\n');

console.log('1. React Hooks Error:');
console.log('   - All useState/useEffect must be declared before any conditional returns');
console.log('   - Check browser console for "Hooks can only be called inside function components"');

console.log('\n2. Import/Export Issues:');
console.log('   - Verify MapLocationSelector is exported as default');
console.log('   - Check import path is correct: ../../components/MapLocationSelector');

console.log('\n3. State Management:');
console.log('   - Ensure showMapSelector state is properly declared');
console.log('   - Check button onClick handler updates state correctly');

console.log('\n4. Environment Variables:');
console.log('   - Check if REACT_APP_GOOGLE_MAPS_API_KEY is set in admin/.env');
console.log('   - Restart development server after adding env variables');

console.log('\n5. Browser Console:');
console.log('   - Open browser dev tools and check for JavaScript errors');
console.log('   - Look for component rendering errors or import failures');

console.log('\n🧪 Quick Test Steps:');
console.log('1. Open browser dev tools (F12)');
console.log('2. Go to Road Status → Add New Roadwork');
console.log('3. Scroll to Location Coordinates section');
console.log('4. Click "Show Map" button');
console.log('5. Check console for any error messages');
console.log('6. Verify showMapSelector state changes in React DevTools');

console.log('\n💡 If button still doesn\'t work:');
console.log('- Add console.log in button onClick handler');
console.log('- Check if button is disabled or has CSS issues');
console.log('- Verify component is properly mounted');
console.log('- Test with a simple alert() in onClick handler');