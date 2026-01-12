/**
 * Script to populate existing locations with NATIS features for testing
 */

const fetch = globalThis.fetch || require('node-fetch');

const ADMIN_API = 'http://localhost:3001/api';

async function populateNatisFeatures() {
  console.log('🏢 Populating NATIS Features for Existing Locations...\n');
  
  try {
    // Get existing locations
    console.log('📋 Step 1: Fetching existing locations...');
    const response = await fetch(`${ADMIN_API}/locations`);
    
    if (!response.ok) {
      console.error('❌ Failed to fetch locations:', response.status);
      return;
    }
    
    const data = await response.json();
    const locations = data.data.locations;
    
    console.log(`Found ${locations.length} locations to update\n`);
    
    // Sample NATIS features to add
    const sampleNatisFeatures = {
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
          open: '09:00',
          close: '13:00'
        },
        publicHolidays: {
          open: '10:00',
          close: '14:00'
        }
      },
      closedDays: ['Sunday'],
      specialHours: [
        {
          date: '2026-03-21',
          reason: 'Independence Day',
          closed: true
        },
        {
          date: '2026-12-25',
          reason: 'Christmas Day',
          closed: true
        },
        {
          date: '2026-12-31',
          reason: 'New Year\'s Eve',
          closed: false,
          hours: {
            open: '08:00',
            close: '12:00'
          }
        }
      ]
    };
    
    // Update each location
    for (let i = 0; i < locations.length; i++) {
      const location = locations[i];
      console.log(`📝 Step ${i + 2}: Updating "${location.name}"...`);
      
      // Customize features per location
      const locationFeatures = {
        ...sampleNatisFeatures,
        // Vary services per location
        services: sampleNatisFeatures.services.slice(0, 3 + (i % 4)),
        // Vary weekend hours
        operatingHours: {
          ...sampleNatisFeatures.operatingHours,
          weekends: i === 0 ? undefined : sampleNatisFeatures.operatingHours.weekends
        }
      };
      
      try {
        const updateResponse = await fetch(`${ADMIN_API}/locations/${location.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            // Note: In real usage, you'd need authentication headers
          },
          body: JSON.stringify(locationFeatures)
        });
        
        if (updateResponse.ok) {
          const updateResult = await updateResponse.json();
          console.log(`  ✅ Updated successfully`);
          console.log(`     Services: ${locationFeatures.services.length} items`);
          console.log(`     Operating Hours: Yes`);
          console.log(`     Closed Days: ${locationFeatures.closedDays.length} days`);
          console.log(`     Special Hours: ${locationFeatures.specialHours.length} items`);
        } else {
          const errorText = await updateResponse.text();
          console.log(`  ❌ Update failed: ${updateResponse.status}`);
          console.log(`     Error: ${errorText}`);
        }
      } catch (error) {
        console.log(`  ❌ Update error: ${error.message}`);
      }
      
      // Add delay to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('\n🧪 Step Final: Verifying updates...');
    
    // Verify the updates
    const verifyResponse = await fetch(`${ADMIN_API}/locations`);
    if (verifyResponse.ok) {
      const verifyData = await verifyResponse.json();
      const updatedLocations = verifyData.data.locations;
      
      console.log('\n📊 Updated Locations Summary:');
      updatedLocations.forEach((loc, index) => {
        console.log(`\n${index + 1}. ${loc.name}`);
        console.log(`   Services: ${loc.services ? loc.services.length : 0} items`);
        console.log(`   Operating Hours: ${loc.operatingHours ? 'Yes' : 'No'}`);
        console.log(`   Closed Days: ${loc.closedDays ? loc.closedDays.length : 0} days`);
        console.log(`   Special Hours: ${loc.specialHours ? loc.specialHours.length : 0} items`);
        
        if (loc.services && loc.services.length > 0) {
          console.log(`   → Services: ${loc.services.join(', ')}`);
        }
      });
      
      console.log('\n✅ All locations updated with NATIS features!');
      console.log('\n💡 Next steps:');
      console.log('1. Open the mobile app');
      console.log('2. Pull down to refresh the offices list');
      console.log('3. Check that all NATIS features now display properly');
      
    } else {
      console.log('⚠️ Could not verify updates');
    }
    
  } catch (error) {
    console.error('❌ Population failed:', error);
  }
}

// Run the population
populateNatisFeatures();