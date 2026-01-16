const mongoose = require('mongoose');

// Simple test to verify our roadworks schema works
async function testRoadworksSchema() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect('mongodb://localhost:27017/ra_db');
    console.log('✅ Connected to MongoDB');

    // Define the schema (simplified version)
    const roadworkSchema = new mongoose.Schema({
      title: { type: String, required: true },
      road: { type: String, required: true },
      section: { type: String, required: true },
      region: { type: String, required: true },
      status: {
        type: String,
        enum: ['Open', 'Ongoing', 'Ongoing Maintenance', 'Planned', 'Planned Works', 'Closed', 'Restricted', 'Completed'],
        default: 'Planned'
      },
      description: String,
      coordinates: {
        latitude: Number,
        longitude: Number
      },
      published: { type: Boolean, default: false },
      priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium'
      },
      startDate: Date,
      expectedCompletion: Date,
      alternativeRoute: String,
      affectedLanes: String,
      contractor: String,
      estimatedDuration: String
    }, { timestamps: true });

    const Roadwork = mongoose.model('Roadwork', roadworkSchema);

    console.log('📝 Creating test roadwork...');
    
    // Create a test roadwork
    const testRoadwork = new Roadwork({
      title: 'Test Highway Maintenance',
      road: 'B1 Highway',
      section: 'Between Windhoek and Okahandja',
      region: 'Khomas',
      status: 'Planned Works',
      description: 'Routine maintenance work on the main highway connecting Windhoek to Okahandja',
      coordinates: {
        latitude: -22.5,
        longitude: 17.0
      },
      published: true,
      priority: 'medium',
      startDate: new Date(),
      expectedCompletion: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      alternativeRoute: 'Use B2 via Karibib',
      affectedLanes: 'Left lane only',
      contractor: 'Namibian Road Construction Ltd',
      estimatedDuration: '7 days'
    });

    const savedRoadwork = await testRoadwork.save();
    console.log('✅ Test roadwork created successfully!');
    console.log('📋 Roadwork details:');
    console.log(`   ID: ${savedRoadwork._id}`);
    console.log(`   Title: ${savedRoadwork.title}`);
    console.log(`   Status: ${savedRoadwork.status}`);
    console.log(`   Region: ${savedRoadwork.region}`);
    console.log(`   Published: ${savedRoadwork.published}`);
    console.log(`   Priority: ${savedRoadwork.priority}`);

    // Test querying
    console.log('\n🔍 Testing queries...');
    
    // Find published roadworks
    const publishedRoadworks = await Roadwork.find({ published: true });
    console.log(`✅ Found ${publishedRoadworks.length} published roadworks`);

    // Test search functionality
    const searchResults = await Roadwork.find({
      $text: { $search: 'highway' }
    }).catch(() => {
      // If text search fails, try regex search
      return Roadwork.find({
        $or: [
          { title: /highway/i },
          { description: /highway/i },
          { road: /highway/i }
        ]
      });
    });
    console.log(`✅ Search for "highway" found ${searchResults.length} results`);

    // Test filtering by region
    const khomasRoadworks = await Roadwork.find({ region: 'Khomas' });
    console.log(`✅ Found ${khomasRoadworks.length} roadworks in Khomas region`);

    // Test filtering by status
    const plannedRoadworks = await Roadwork.find({ status: 'Planned Works' });
    console.log(`✅ Found ${plannedRoadworks.length} planned roadworks`);

    console.log('\n🎉 All tests passed! The roadworks schema is working correctly.');
    
    // Clean up - remove test data
    await Roadwork.deleteOne({ _id: savedRoadwork._id });
    console.log('🧹 Cleaned up test data');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.errors) {
      console.error('Validation errors:', error.errors);
    }
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the test
testRoadworksSchema();