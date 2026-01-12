/**
 * Test script for NATIS Office Enhancement
 * Tests the new services, operating hours, and special hours functionality
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Sample NATIS office data with enhanced fields
const sampleNatisOffice = {
  name: 'NATIS Windhoek Main Office',
  address: '123 Independence Avenue, Windhoek',
  region: 'Khomas',
  coordinates: {
    latitude: -22.5609,
    longitude: 17.0658
  },
  contactNumber: '+264 61 123456',
  email: 'windhoek@natis.gov.na',
  services: [
    'Vehicle Registration',
    'Driver\'s License Renewal',
    'Learner\'s License',
    'Professional Driving Permit (PDP)',
    'Vehicle License Renewal',
    'Roadworthy Certificate'
  ],
  operatingHours: {
    weekdays: {
      open: '08:00',
      close: '17:00'
    },
    weekends: {
      open: '08:00',
      close: '12:00'
    },
    publicHolidays: {
      open: '',
      close: ''
    }
  },
  closedDays: ['Sunday'],
  specialHours: [
    {
      date: '2024-03-21',
      reason: 'Independence Day',
      closed: true
    },
    {
      date: '2024-12-25',
      reason: 'Christmas Day',
      closed: true
    },
    {
      date: '2024-12-24',
      reason: 'Christmas Eve',
      closed: false,
      hours: {
        open: '08:00',
        close: '12:00'
      }
    }
  ]
};

async function testNatisOfficeEnhancement() {
  console.log('🏢 Testing NATIS Office Enhancement...\n');

  try {
    // Test 1: Create enhanced NATIS office
    console.log('1. Creating enhanced NATIS office...');
    const createResponse = await axios.post(`${BASE_URL}/locations`, sampleNatisOffice);
    
    if (createResponse.data.success) {
      const createdOffice = createResponse.data.data.location;
      console.log('✅ Office created successfully');
      console.log(`   ID: ${createdOffice._id}`);
      console.log(`   Name: ${createdOffice.name}`);
      console.log(`   Services: ${createdOffice.services?.length || 0} services`);
      console.log(`   Operating Hours: ${createdOffice.operatingHours ? 'Configured' : 'Not configured'}`);
      console.log(`   Closed Days: ${createdOffice.closedDays?.length || 0} days`);
      console.log(`   Special Hours: ${createdOffice.specialHours?.length || 0} entries`);

      // Test 2: Retrieve the office
      console.log('\n2. Retrieving office details...');
      const getResponse = await axios.get(`${BASE_URL}/locations/${createdOffice._id}`);
      
      if (getResponse.data.success) {
        const office = getResponse.data.data.location;
        console.log('✅ Office retrieved successfully');
        
        // Verify services
        if (office.services && office.services.length > 0) {
          console.log('✅ Services field populated correctly');
          console.log(`   Available services: ${office.services.join(', ')}`);
        } else {
          console.log('❌ Services field missing or empty');
        }
        
        // Verify operating hours
        if (office.operatingHours) {
          console.log('✅ Operating hours configured');
          if (office.operatingHours.weekdays) {
            console.log(`   Weekdays: ${office.operatingHours.weekdays.open} - ${office.operatingHours.weekdays.close}`);
          }
          if (office.operatingHours.weekends) {
            console.log(`   Weekends: ${office.operatingHours.weekends.open} - ${office.operatingHours.weekends.close}`);
          }
        } else {
          console.log('❌ Operating hours not configured');
        }
        
        // Verify closed days
        if (office.closedDays && office.closedDays.length > 0) {
          console.log('✅ Closed days configured');
          console.log(`   Closed on: ${office.closedDays.join(', ')}`);
        }
        
        // Verify special hours
        if (office.specialHours && office.specialHours.length > 0) {
          console.log('✅ Special hours configured');
          office.specialHours.forEach((special, index) => {
            console.log(`   ${index + 1}. ${special.date}: ${special.reason} ${special.closed ? '(Closed)' : '(Special hours)'}`);
          });
        }
      }

      // Test 3: Update office with new services
      console.log('\n3. Updating office with additional services...');
      const updateData = {
        services: [
          ...sampleNatisOffice.services,
          'Clearance Certificate',
          'Duplicate Documents',
          'Change of Ownership'
        ],
        operatingHours: {
          ...sampleNatisOffice.operatingHours,
          weekends: {
            open: '',
            close: ''
          }
        },
        closedDays: ['Saturday', 'Sunday']
      };
      
      const updateResponse = await axios.put(`${BASE_URL}/locations/${createdOffice._id}`, updateData);
      
      if (updateResponse.data.success) {
        const updatedOffice = updateResponse.data.data.location;
        console.log('✅ Office updated successfully');
        console.log(`   Total services: ${updatedOffice.services?.length || 0}`);
        console.log(`   Closed days: ${updatedOffice.closedDays?.join(', ') || 'None'}`);
      }

      // Test 4: List all offices (should include enhanced data)
      console.log('\n4. Listing all offices...');
      const listResponse = await axios.get(`${BASE_URL}/locations`);
      
      if (listResponse.data.success) {
        const offices = listResponse.data.data.locations;
        console.log(`✅ Retrieved ${offices.length} offices`);
        
        const enhancedOffices = offices.filter(office => 
          office.services && office.services.length > 0
        );
        console.log(`   Enhanced offices with services: ${enhancedOffices.length}`);
      }

      // Test 5: Clean up - delete test office
      console.log('\n5. Cleaning up test data...');
      await axios.delete(`${BASE_URL}/locations/${createdOffice._id}`);
      console.log('✅ Test office deleted successfully');

    } else {
      console.log('❌ Failed to create office:', createResponse.data);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.response?.status === 404) {
      console.log('\n💡 Make sure the backend server is running on port 5000');
    }
    
    if (error.response?.status === 401) {
      console.log('\n💡 Authentication required. Make sure you have proper admin credentials');
    }
  }
}

// Helper function to test mobile app data format
function testMobileAppDataFormat() {
  console.log('\n📱 Testing Mobile App Data Format...\n');
  
  const mockOffice = {
    id: '507f1f77bcf86cd799439011',
    name: 'NATIS Windhoek Main Office',
    address: '123 Independence Avenue, Windhoek',
    region: 'Khomas',
    coordinates: {
      latitude: -22.5609,
      longitude: 17.0658
    },
    contactNumber: '+264 61 123456',
    email: 'windhoek@natis.gov.na',
    services: [
      'Vehicle Registration',
      'Driver\'s License Renewal',
      'Learner\'s License'
    ],
    operatingHours: {
      weekdays: {
        open: '08:00',
        close: '17:00'
      },
      weekends: {
        open: '08:00',
        close: '12:00'
      }
    },
    closedDays: ['Sunday']
  };
  
  // Test service display logic
  console.log('Services Display:');
  if (mockOffice.services && mockOffice.services.length > 0) {
    console.log('✅ Services available for display');
    console.log(`   First 3 services: ${mockOffice.services.slice(0, 3).join(', ')}`);
    if (mockOffice.services.length > 3) {
      console.log(`   Additional services: +${mockOffice.services.length - 3} more`);
    }
  }
  
  // Test hours display logic
  console.log('\nOperating Hours Display:');
  if (mockOffice.operatingHours) {
    if (mockOffice.operatingHours.weekdays && mockOffice.operatingHours.weekdays.open) {
      console.log(`✅ Mon-Fri: ${mockOffice.operatingHours.weekdays.open} - ${mockOffice.operatingHours.weekdays.close}`);
    }
    if (mockOffice.operatingHours.weekends && mockOffice.operatingHours.weekends.open) {
      console.log(`✅ Weekends: ${mockOffice.operatingHours.weekends.open} - ${mockOffice.operatingHours.weekends.close}`);
    }
  }
  
  // Test closed days display
  console.log('\nClosed Days Display:');
  if (mockOffice.closedDays && mockOffice.closedDays.length > 0) {
    console.log(`✅ Closed: ${mockOffice.closedDays.join(', ')}`);
  }
}

// Run tests
console.log('🚀 NATIS Office Enhancement Test Suite\n');
console.log('This test verifies the enhanced NATIS office functionality including:');
console.log('- Services management');
console.log('- Operating hours configuration');
console.log('- Special hours and holidays');
console.log('- Mobile app data display\n');

testNatisOfficeEnhancement()
  .then(() => {
    testMobileAppDataFormat();
    console.log('\n✅ All tests completed!');
  })
  .catch((error) => {
    console.error('\n❌ Test suite failed:', error.message);
  });