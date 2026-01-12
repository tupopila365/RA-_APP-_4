/**
 * Debug script to check exactly what the backend is returning
 */

const fetch = globalThis.fetch || require('node-fetch');

const ADMIN_API = 'http://localhost:3001/api';
const MOBILE_API = 'http://localhost:5000/api';

async function debugBackendResponse() {
  console.log('🔍 Debugging Backend Response Structure...\n');
  
  try {
    // Check admin API response
    console.log('📋 Admin API Response:');
    const adminResponse = await fetch(`${ADMIN_API}/locations`);
    
    if (adminResponse.ok) {
      const adminData = await adminResponse.json();
      console.log('Total locations:', adminData.data.locations.length);
      
      if (adminData.data.locations.length > 0) {
        const sample = adminData.data.locations[0];
        console.log('\nSample location structure:');
        console.log('- id:', sample.id);
        console.log('- name:', sample.name);
        console.log('- address:', sample.address);
        console.log('- region:', sample.region);
        console.log('- coordinates:', sample.coordinates);
        console.log('- contactNumber:', sample.contactNumber);
        console.log('- email:', sample.email);
        console.log('- services:', sample.services);
        console.log('- operatingHours:', JSON.stringify(sample.operatingHours, null, 2));
        console.log('- closedDays:', sample.closedDays);
        console.log('- specialHours:', JSON.stringify(sample.specialHours, null, 2));
        console.log('- createdAt:', sample.createdAt);
        console.log('- updatedAt:', sample.updatedAt);
        
        // Check each location for NATIS features
        console.log('\n📊 NATIS Features Analysis:');
        adminData.data.locations.forEach((loc, index) => {
          console.log(`\nLocation ${index + 1}: ${loc.name}`);
          console.log(`  Services: ${loc.services ? loc.services.length : 0} items`);
          console.log(`  Operating Hours: ${loc.operatingHours ? 'Yes' : 'No'}`);
          console.log(`  Closed Days: ${loc.closedDays ? loc.closedDays.length : 0} days`);
          console.log(`  Special Hours: ${loc.specialHours ? loc.specialHours.length : 0} items`);
          
          if (loc.services && loc.services.length > 0) {
            console.log(`    Services: ${loc.services.join(', ')}`);
          }
          
          if (loc.operatingHours) {
            if (loc.operatingHours.weekdays) {
              console.log(`    Weekdays: ${loc.operatingHours.weekdays.open} - ${loc.operatingHours.weekdays.close}`);
            }
            if (loc.operatingHours.weekends && loc.operatingHours.weekends.open) {
              console.log(`    Weekends: ${loc.operatingHours.weekends.open} - ${loc.operatingHours.weekends.close}`);
            }
            if (loc.operatingHours.publicHolidays && loc.operatingHours.publicHolidays.open) {
              console.log(`    Public Holidays: ${loc.operatingHours.publicHolidays.open} - ${loc.operatingHours.publicHolidays.close}`);
            }
          }
          
          if (loc.closedDays && loc.closedDays.length > 0) {
            console.log(`    Closed Days: ${loc.closedDays.join(', ')}`);
          }
          
          if (loc.specialHours && loc.specialHours.length > 0) {
            console.log(`    Special Hours: ${loc.specialHours.length} entries`);
            loc.specialHours.forEach((sh, i) => {
              console.log(`      ${i + 1}. ${sh.date}: ${sh.reason} ${sh.closed ? '(CLOSED)' : `(${sh.hours?.open} - ${sh.hours?.close})`}`);
            });
          }
        });
      }
    } else {
      console.error('❌ Admin API failed:', adminResponse.status);
    }
    
    // Check mobile API response
    console.log('\n📱 Mobile API Response:');
    const mobileResponse = await fetch(`${MOBILE_API}/locations`);
    
    if (mobileResponse.ok) {
      const mobileData = await mobileResponse.json();
      console.log('Total locations:', mobileData.data.locations.length);
      
      if (mobileData.data.locations.length > 0) {
        const sample = mobileData.data.locations[0];
        console.log('\nSample mobile location structure:');
        console.log('- id:', sample.id);
        console.log('- name:', sample.name);
        console.log('- services:', sample.services);
        console.log('- operatingHours:', JSON.stringify(sample.operatingHours, null, 2));
        console.log('- closedDays:', sample.closedDays);
        console.log('- specialHours:', JSON.stringify(sample.specialHours, null, 2));
        
        // Test mobile app display conditions
        console.log('\n🧪 Mobile App Display Tests:');
        mobileData.data.locations.forEach((office, index) => {
          console.log(`\nLocation ${index + 1}: ${office.name}`);
          
          // Test services display condition
          const showServices = office.services && office.services.length > 0;
          console.log(`  Services section will show: ${showServices}`);
          if (showServices) {
            console.log(`    Will display: ${office.services.slice(0, 3).join(', ')}${office.services.length > 3 ? ` +${office.services.length - 3} more` : ''}`);
          }
          
          // Test operating hours display condition
          const showOperatingHours = !!office.operatingHours;
          console.log(`  Operating Hours section will show: ${showOperatingHours}`);
          if (showOperatingHours) {
            const weekdays = office.operatingHours.weekdays && office.operatingHours.weekdays.open;
            const weekends = office.operatingHours.weekends && office.operatingHours.weekends.open;
            const holidays = office.operatingHours.publicHolidays && office.operatingHours.publicHolidays.open;
            const closedDays = office.closedDays && office.closedDays.length > 0;
            
            console.log(`    Weekdays row will show: ${!!weekdays}`);
            console.log(`    Weekends row will show: ${!!weekends}`);
            console.log(`    Public Holidays row will show: ${!!holidays}`);
            console.log(`    Closed Days row will show: ${!!closedDays}`);
          }
          
          // Test special hours display condition
          const showSpecialHours = office.specialHours && office.specialHours.length > 0;
          console.log(`  Special Hours section will show: ${showSpecialHours}`);
          if (showSpecialHours) {
            console.log(`    Will display: ${office.specialHours.length} special days (showing first 2)`);
          }
        });
      }
    } else {
      console.error('❌ Mobile API failed:', mobileResponse.status);
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
}

// Run the debug
debugBackendResponse();