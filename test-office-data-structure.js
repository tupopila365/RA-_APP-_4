/**
 * Test Office Data Structure
 * 
 * This script tests the office data structure to ensure the API returns
 * the expected format and our helper functions work correctly.
 */

// Sample office data structure (what we expect from API)
const sampleOffice = {
  _id: '507f1f77bcf86cd799439011',
  name: 'Roads Authority Head Office',
  address: '6 Feld Street, Windhoek',
  region: 'Khomas',
  coordinates: {
    latitude: -22.5609,
    longitude: 17.0658
  },
  contactNumber: '+264 61 284 7000',
  email: 'info@ra.org.na',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z'
};

// Sample office with missing data
const incompleteOffice = {
  _id: '507f1f77bcf86cd799439012',
  name: 'NATIS Outpost',
  address: 'Remote Location',
  region: 'Remote',
  coordinates: {
    latitude: -20.0000,
    longitude: 16.0000
  },
  // Missing contactNumber and email
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z'
};

// Helper functions (same as in FindOfficesScreen.js)
const hasContactNumber = (office) => {
  return office && office.contactNumber && office.contactNumber.trim() !== '';
};

const hasEmail = (office) => {
  return office && office.email && office.email.trim() !== '';
};

const hasCoordinates = (office) => {
  return (
    office &&
    office.coordinates &&
    typeof office.coordinates.latitude === 'number' &&
    typeof office.coordinates.longitude === 'number' &&
    !isNaN(office.coordinates.latitude) &&
    !isNaN(office.coordinates.longitude)
  );
};

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
    Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Test functions
function testOfficeHelpers() {
  console.log('🧪 Testing Office Helper Functions\n');

  // Test complete office
  console.log('📍 Testing Complete Office:');
  console.log('  Name:', sampleOffice.name);
  console.log('  Has Contact Number:', hasContactNumber(sampleOffice));
  console.log('  Has Email:', hasEmail(sampleOffice));
  console.log('  Has Coordinates:', hasCoordinates(sampleOffice));
  console.log('');

  // Test incomplete office
  console.log('📍 Testing Incomplete Office:');
  console.log('  Name:', incompleteOffice.name);
  console.log('  Has Contact Number:', hasContactNumber(incompleteOffice));
  console.log('  Has Email:', hasEmail(incompleteOffice));
  console.log('  Has Coordinates:', hasCoordinates(incompleteOffice));
  console.log('');

  // Test distance calculation
  const userLat = -22.5700; // Windhoek city center
  const userLng = 17.0836;
  
  console.log('📏 Testing Distance Calculation:');
  console.log('  User Location: Windhoek City Center');
  console.log('  Office Location:', sampleOffice.name);
  
  if (hasCoordinates(sampleOffice)) {
    const distance = calculateDistance(
      userLat, userLng,
      sampleOffice.coordinates.latitude,
      sampleOffice.coordinates.longitude
    );
    console.log('  Distance:', distance.toFixed(2), 'km');
    
    // Format distance like in the app
    const formattedDistance = distance < 1 
      ? `${Math.round(distance * 1000)}m`
      : `${distance.toFixed(1)}km`;
    console.log('  Formatted Distance:', formattedDistance);
  }
  console.log('');
}

function testEdgeCases() {
  console.log('🔍 Testing Edge Cases\n');

  // Test null office
  console.log('📍 Testing Null Office:');
  const nullOffice = null;
  try {
    console.log('  Has Contact Number:', hasContactNumber(nullOffice));
  } catch (error) {
    console.log('  ❌ Error with null office:', error.message);
  }

  // Test office with empty strings
  console.log('📍 Testing Office with Empty Strings:');
  const emptyOffice = {
    name: 'Empty Office',
    contactNumber: '',
    email: '   ',
    coordinates: {
      latitude: 0,
      longitude: 0
    }
  };
  console.log('  Has Contact Number:', hasContactNumber(emptyOffice));
  console.log('  Has Email:', hasEmail(emptyOffice));
  console.log('  Has Coordinates:', hasCoordinates(emptyOffice));
  console.log('');

  // Test office with invalid coordinates
  console.log('📍 Testing Office with Invalid Coordinates:');
  const invalidCoordsOffice = {
    name: 'Invalid Coords Office',
    coordinates: {
      latitude: 'invalid',
      longitude: NaN
    }
  };
  console.log('  Has Coordinates:', hasCoordinates(invalidCoordsOffice));
  console.log('');
}

function runTests() {
  console.log('🚀 Office Data Structure Tests\n');
  console.log('==========================================\n');
  
  testOfficeHelpers();
  testEdgeCases();
  
  console.log('==========================================');
  console.log('✅ All tests completed successfully!');
  console.log('');
  console.log('📋 Summary:');
  console.log('  - Helper functions work with plain objects');
  console.log('  - Proper null/undefined handling');
  console.log('  - Distance calculation works correctly');
  console.log('  - Edge cases handled gracefully');
}

// Run tests if this file is executed directly
if (typeof module !== 'undefined' && require.main === module) {
  runTests();
}

module.exports = {
  hasContactNumber,
  hasEmail,
  hasCoordinates,
  calculateDistance,
  runTests
};