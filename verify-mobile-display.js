/**
 * Script to verify that mobile app will display NATIS features correctly
 */

const fetch = globalThis.fetch || require('node-fetch');

const MOBILE_API = 'http://localhost:5000/api';

async function verifyMobileDisplay() {
  console.log('📱 Verifying Mobile App Display Logic...\n');
  
  try {
    console.log('📋 Fetching locations from mobile API...');
    const response = await fetch(`${MOBILE_API}/locations`);
    
    if (!response.ok) {
      console.error('❌ Mobile API failed:', response.status);
      return;
    }
    
    const data = await response.json();
    const locations = data.data.locations;
    
    console.log(`Found ${locations.length} locations\n`);
    
    // Test each location against mobile app display logic
    locations.forEach((office, index) => {
      console.log(`🏢 Location ${index + 1}: ${office.name}`);
      console.log('─'.repeat(50));
      
      // Test Services Section
      const showServices = office.services && office.services.length > 0;
      console.log(`📋 Services Section:`);
      console.log(`   Will Display: ${showServices ? '✅ YES' : '❌ NO'}`);
      if (showServices) {
        const displayServices = office.services.slice(0, 3);
        const moreCount = office.services.length > 3 ? office.services.length - 3 : 0;
        console.log(`   Services: ${displayServices.join(', ')}${moreCount > 0 ? ` +${moreCount} more` : ''}`);
      } else {
        console.log(`   Reason: ${!office.services ? 'services is null/undefined' : 'services array is empty'}`);
      }
      
      // Test Operating Hours Section
      const showOperatingHours = !!office.operatingHours;
      console.log(`\n⏰ Operating Hours Section:`);
      console.log(`   Will Display: ${showOperatingHours ? '✅ YES' : '❌ NO'}`);
      
      if (showOperatingHours) {
        // Test individual rows
        const weekdays = office.operatingHours.weekdays && office.operatingHours.weekdays.open;
        const weekends = office.operatingHours.weekends && office.operatingHours.weekends.open;
        const holidays = office.operatingHours.publicHolidays && office.operatingHours.publicHolidays.open;
        const closedDays = office.closedDays && office.closedDays.length > 0;
        
        console.log(`   Weekdays Row: ${weekdays ? '✅' : '❌'} ${weekdays ? `(${office.operatingHours.weekdays.open} - ${office.operatingHours.weekdays.close})` : ''}`);
        console.log(`   Weekends Row: ${weekends ? '✅' : '❌'} ${weekends ? `(${office.operatingHours.weekends.open} - ${office.operatingHours.weekends.close})` : ''}`);
        console.log(`   Public Holidays Row: ${holidays ? '✅' : '❌'} ${holidays ? `(${office.operatingHours.publicHolidays.open} - ${office.operatingHours.publicHolidays.close})` : ''}`);
        console.log(`   Closed Days Row: ${closedDays ? '✅' : '❌'} ${closedDays ? `(${office.closedDays.join(', ')})` : ''}`);
      } else {
        console.log(`   Reason: operatingHours is ${office.operatingHours === null ? 'null' : office.operatingHours === undefined ? 'undefined' : 'falsy'}`);
      }
      
      // Test Special Hours Section
      const showSpecialHours = office.specialHours && office.specialHours.length > 0;
      console.log(`\n📅 Special Hours Section:`);
      console.log(`   Will Display: ${showSpecialHours ? '✅ YES' : '❌ NO'}`);
      
      if (showSpecialHours) {
        const displayCount = Math.min(office.specialHours.length, 2);
        const moreCount = office.specialHours.length > 2 ? office.specialHours.length - 2 : 0;
        console.log(`   Special Days: ${displayCount} shown${moreCount > 0 ? `, +${moreCount} more` : ''}`);
        
        office.specialHours.slice(0, 2).forEach((sh, i) => {
          const date = new Date(sh.date);
          const formattedDate = date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
          });
          console.log(`     ${i + 1}. ${formattedDate}: ${sh.reason} ${sh.closed ? '(CLOSED)' : `(${sh.hours?.open} - ${sh.hours?.close})`}`);
        });
      } else {
        console.log(`   Reason: ${!office.specialHours ? 'specialHours is null/undefined' : 'specialHours array is empty'}`);
      }
      
      console.log('\n');
    });
    
    // Summary
    const locationsWithServices = locations.filter(loc => loc.services && loc.services.length > 0).length;
    const locationsWithHours = locations.filter(loc => !!loc.operatingHours).length;
    const locationsWithSpecialHours = locations.filter(loc => loc.specialHours && loc.specialHours.length > 0).length;
    
    console.log('📊 Summary:');
    console.log(`   Locations with Services: ${locationsWithServices}/${locations.length}`);
    console.log(`   Locations with Operating Hours: ${locationsWithHours}/${locations.length}`);
    console.log(`   Locations with Special Hours: ${locationsWithSpecialHours}/${locations.length}`);
    
    if (locationsWithServices === 0) {
      console.log('\n⚠️  No locations have services configured!');
      console.log('   Run: node populate-natis-features.js');
    }
    
    if (locationsWithHours === 0) {
      console.log('\n⚠️  No locations have operating hours configured!');
      console.log('   Run: node populate-natis-features.js');
    }
    
    if (locationsWithSpecialHours === 0) {
      console.log('\n⚠️  No locations have special hours configured!');
      console.log('   Run: node populate-natis-features.js');
    }
    
    if (locationsWithServices > 0 && locationsWithHours > 0 && locationsWithSpecialHours > 0) {
      console.log('\n✅ All NATIS features are properly configured and will display in mobile app!');
    }
    
  } catch (error) {
    console.error('❌ Verification failed:', error);
  }
}

// Run the verification
verifyMobileDisplay();