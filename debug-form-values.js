// Debug script to check form values - paste this in browser console on the location form page

console.log('🔍 Debugging form coordinate values...');

// Method 1: Check DOM inputs directly
const latInput = document.querySelector('input[name*="latitude"]') || 
                 document.querySelector('input[type="number"]');
const lonInput = document.querySelectorAll('input[type="number"]')[1];

console.log('DOM Inputs:');
console.log('Latitude input:', latInput);
console.log('Latitude value:', latInput?.value);
console.log('Longitude input:', lonInput);
console.log('Longitude value:', lonInput?.value);

// Method 2: Check all number inputs
const numberInputs = document.querySelectorAll('input[type="number"]');
console.log('All number inputs:', numberInputs);
numberInputs.forEach((input, index) => {
  console.log(`Input ${index}:`, {
    name: input.name,
    value: input.value,
    type: typeof input.value,
    placeholder: input.placeholder
  });
});

// Method 3: Check if React form state is accessible
if (window.React) {
  console.log('React is available');
  
  // Try to find React fiber
  const reactFiber = latInput?._reactInternalFiber || latInput?.__reactInternalInstance;
  if (reactFiber) {
    console.log('React fiber found:', reactFiber);
  }
}

// Method 4: Manual test function
window.testCoordinateRetrieval = function() {
  const lat = latInput?.value;
  const lon = lonInput?.value;
  
  console.log('Manual retrieval test:');
  console.log('Latitude:', lat, typeof lat);
  console.log('Longitude:', lon, typeof lon);
  
  const latNum = parseFloat(lat);
  const lonNum = parseFloat(lon);
  
  console.log('Parsed numbers:');
  console.log('Latitude:', latNum, isNaN(latNum) ? 'INVALID' : 'VALID');
  console.log('Longitude:', lonNum, isNaN(lonNum) ? 'INVALID' : 'VALID');
  
  return { lat: latNum, lon: lonNum };
};

console.log('✅ Debug script loaded. Run testCoordinateRetrieval() to test manually.');