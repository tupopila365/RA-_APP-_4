const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

// You need to get this token by logging in first
// Run: node generate-test-credentials.js to get admin credentials
// Then login via the admin interface or API to get the token
const TOKEN = process.env.ADMIN_TOKEN || 'YOUR_ADMIN_TOKEN_HERE';

async function testRoadClosureAPI() {
  console.log('🧪 Testing Road Closure API with Alternate Routes\n');

  try {
    // Test 1: Create road closure with alternate routes
    console.log('1️⃣ Creating road closure with alternate routes...');
    const createResponse = await axios.post(
      `${API_URL}/road-status/road-closures`,
      {
        title: 'B1 Road Closure - Okahandja to Otjiwarongo',
        region: 'Khomas',
        description: 'Emergency repairs due to flood damage',
        priority: 'high',
        published: true,
        startDate: '2026-02-01',
        expectedCompletion: '2026-02-15',
        roadClosure: {
          roadCode: 'B1',
          startTown: 'Okahandja',
          endTown: 'Otjiwarongo',
          startCoordinates: { latitude: -21.9833, longitude: 16.9167 },
          endCoordinates: { latitude: -20.4667, longitude: 16.6500 }
        },
        alternateRoutes: [
          {
            routeName: 'Via Gross Barmen & Otavi (Recommended)',
            roadsUsed: ['C28', 'D1268'],
            waypoints: [
              { name: 'Gross Barmen', coordinates: { latitude: -21.9500, longitude: 16.8000 } },
              { name: 'Otavi', coordinates: { latitude: -19.6500, longitude: 17.3333 } }
            ],
            vehicleType: ['All'],
            isRecommended: true,
            approved: false
          },
          {
            routeName: 'Via Karibib (Light Vehicles Only)',
            roadsUsed: ['C33', 'D1935'],
            waypoints: [
              { name: 'Karibib', coordinates: { latitude: -21.9333, longitude: 15.8333 } },
              { name: 'Usakos', coordinates: { latitude: -21.9833, longitude: 15.6000 } }
            ],
            vehicleType: ['Light Vehicles'],
            isRecommended: false,
            approved: false
          },
          {
            routeName: 'Heavy Vehicle Route',
            roadsUsed: ['C28', 'D2102'],
            waypoints: [
              { name: 'Industrial Area', coordinates: { latitude: -22.0000, longitude: 16.9000 } },
              { name: 'Truck Stop', coordinates: { latitude: -21.5000, longitude: 16.7000 } }
            ],
            vehicleType: ['Heavy Vehicles', 'Trucks'],
            isRecommended: false,
            approved: false
          }
        ]
      },
      {
        headers: { Authorization: `Bearer ${TOKEN}` }
      }
    );

    console.log('✅ Road closure created successfully!');
    console.log(`   ID: ${createResponse.data.data.roadwork._id}`);
    console.log(`   Title: ${createResponse.data.data.roadwork.title}`);
    console.log(`   Alternate Routes: ${createResponse.data.data.roadwork.alternateRoutes?.length || 0}`);

    const closureId = createResponse.data.data.roadwork._id;

    // Test 2: Get road closure with routes
    console.log('\n2️⃣ Retrieving road closure...');
    const getResponse = await axios.get(
      `${API_URL}/road-status/road-closures/${closureId}`
    );

    console.log('✅ Road closure retrieved successfully!');
    console.log(`   Road Code: ${getResponse.data.data.roadClosure?.roadCode}`);
    console.log(`   Start: ${getResponse.data.data.roadClosure?.startTown}`);
    console.log(`   End: ${getResponse.data.data.roadClosure?.endTown}`);
    console.log(`   Routes: ${getResponse.data.data.alternateRoutes?.length || 0}`);

    if (getResponse.data.data.alternateRoutes) {
      getResponse.data.data.alternateRoutes.forEach((route, index) => {
        console.log(`   Route ${index + 1}: ${route.routeName}`);
        console.log(`     - Waypoints: ${route.waypoints?.length || 0}`);
        console.log(`     - Vehicle Types: ${route.vehicleType?.join(', ')}`);
        console.log(`     - Recommended: ${route.isRecommended ? 'Yes' : 'No'}`);
        console.log(`     - Approved: ${route.approved ? 'Yes' : 'No'}`);
      });
    }

    // Test 3: Approve first alternate route
    console.log('\n3️⃣ Approving first alternate route...');
    const approveResponse = await axios.put(
      `${API_URL}/road-status/${closureId}/alternate-routes/0/approve`,
      {},
      {
        headers: { Authorization: `Bearer ${TOKEN}` }
      }
    );

    console.log('✅ Route approved successfully!');
    console.log(`   Route: ${approveResponse.data.data.roadwork.alternateRoutes[0].routeName}`);
    console.log(`   Approved: ${approveResponse.data.data.roadwork.alternateRoutes[0].approved}`);

    // Test 4: Update road closure
    console.log('\n4️⃣ Updating road closure...');
    const updateResponse = await axios.put(
      `${API_URL}/road-status/road-closures/${closureId}`,
      {
        description: 'Emergency repairs due to flood damage - Updated with new timeline',
        expectedCompletion: '2026-02-20'
      },
      {
        headers: { Authorization: `Bearer ${TOKEN}` }
      }
    );

    console.log('✅ Road closure updated successfully!');
    console.log(`   New completion date: ${updateResponse.data.data.roadwork.expectedCompletion}`);

    // Test 5: Get all road status (should include our closure)
    console.log('\n5️⃣ Listing all road status...');
    const listResponse = await axios.get(
      `${API_URL}/road-status?limit=5`
    );

    console.log('✅ Road status list retrieved!');
    console.log(`   Total: ${listResponse.data.data.pagination.total}`);
    console.log(`   Showing: ${listResponse.data.data.roadworks.length}`);

    console.log('\n🎉 All tests passed successfully!');
    console.log('\n📝 Next Steps:');
    console.log('   1. Open admin interface: http://localhost:3001');
    console.log('   2. Navigate to Road Status');
    console.log('   3. Click "Create Road Closure with Routes"');
    console.log('   4. Fill in the form and test the UI');
    console.log('   5. Check mobile app to see routes on map');

  } catch (error) {
    console.error('\n❌ Test failed!');
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Error:', error.response.data);
    } else {
      console.error('   Error:', error.message);
    }
    
    if (error.message.includes('ECONNREFUSED')) {
      console.error('\n💡 Tip: Make sure the backend is running on http://localhost:5000');
      console.error('   Run: cd backend && npm run dev');
    }
    
    if (error.response?.status === 401) {
      console.error('\n💡 Tip: You need a valid admin token');
      console.error('   1. Login to admin interface');
      console.error('   2. Open browser console');
      console.error('   3. Run: localStorage.getItem("token")');
      console.error('   4. Set TOKEN variable in this script');
      console.error('   Or set environment variable: ADMIN_TOKEN=your_token node test-road-closure-api.js');
    }
  }
}

// Run the tests
testRoadClosureAPI();
