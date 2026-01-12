/**
 * Sample Office Data Population Script
 * 
 * This script populates the database with sample RA and NATIS office locations
 * for testing the Find Offices functionality.
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Import the Location model
const { LocationModel } = require('../src/modules/locations/locations.model');

// Sample office data for Namibia
const sampleOffices = [
  // Windhoek Region
  {
    name: 'Roads Authority Head Office',
    address: '6 Feld Street, Windhoek',
    region: 'Khomas',
    coordinates: {
      latitude: -22.5609,
      longitude: 17.0658
    },
    contactNumber: '+264 61 284 7000',
    email: 'info@ra.org.na'
  },
  {
    name: 'NATIS Windhoek Central',
    address: 'Corner of Independence Avenue & Fidel Castro Street, Windhoek',
    region: 'Khomas',
    coordinates: {
      latitude: -22.5700,
      longitude: 17.0836
    },
    contactNumber: '+264 61 208 7111',
    email: 'windhoek@natis.com.na'
  },
  {
    name: 'NATIS Katutura',
    address: 'Katutura Community Hall, Windhoek',
    region: 'Khomas',
    coordinates: {
      latitude: -22.5300,
      longitude: 17.0400
    },
    contactNumber: '+264 61 208 7222',
    email: 'katutura@natis.com.na'
  },
  
  // Erongo Region
  {
    name: 'Roads Authority Swakopmund Office',
    address: 'Libertina Amathila Avenue, Swakopmund',
    region: 'Erongo',
    coordinates: {
      latitude: -22.6792,
      longitude: 14.5272
    },
    contactNumber: '+264 64 410 2000',
    email: 'swakopmund@ra.org.na'
  },
  {
    name: 'NATIS Walvis Bay',
    address: '13th Road, Walvis Bay',
    region: 'Erongo',
    coordinates: {
      latitude: -22.9576,
      longitude: 14.5052
    },
    contactNumber: '+264 64 208 2111',
    email: 'walvisbay@natis.com.na'
  },
  
  // Oshana Region
  {
    name: 'Roads Authority Oshakati Office',
    address: 'Main Road, Oshakati',
    region: 'Oshana',
    coordinates: {
      latitude: -17.7886,
      longitude: 15.6982
    },
    contactNumber: '+264 65 220 3000',
    email: 'oshakati@ra.org.na'
  },
  {
    name: 'NATIS Oshakati',
    address: 'Oshakati Town Council Building',
    region: 'Oshana',
    coordinates: {
      latitude: -17.7850,
      longitude: 15.7000
    },
    contactNumber: '+264 65 220 3111',
    email: 'oshakati@natis.com.na'
  },
  
  // Otjozondjupa Region
  {
    name: 'Roads Authority Otjiwarongo Office',
    address: 'Hage Geingob Street, Otjiwarongo',
    region: 'Otjozondjupa',
    coordinates: {
      latitude: -20.4631,
      longitude: 16.6475
    },
    contactNumber: '+264 67 302 4000',
    email: 'otjiwarongo@ra.org.na'
  },
  {
    name: 'NATIS Grootfontein',
    address: 'Kaiser Street, Grootfontein',
    region: 'Otjozondjupa',
    coordinates: {
      latitude: -19.5667,
      longitude: 18.1167
    },
    contactNumber: '+264 67 242 5111',
    email: 'grootfontein@natis.com.na'
  },
  
  // Hardap Region
  {
    name: 'Roads Authority Mariental Office',
    address: 'Van Riebeeck Street, Mariental',
    region: 'Hardap',
    coordinates: {
      latitude: -24.6292,
      longitude: 17.9614
    },
    contactNumber: '+264 63 242 6000',
    email: 'mariental@ra.org.na'
  },
  {
    name: 'NATIS Rehoboth',
    address: 'Church Street, Rehoboth',
    region: 'Hardap',
    coordinates: {
      latitude: -23.3167,
      longitude: 17.0833
    },
    contactNumber: '+264 62 522 7111',
    email: 'rehoboth@natis.com.na'
  },
  
  // Karas Region
  {
    name: 'Roads Authority Keetmanshoop Office',
    address: '5th Avenue, Keetmanshoop',
    region: 'Karas',
    coordinates: {
      latitude: -26.5833,
      longitude: 18.1333
    },
    contactNumber: '+264 63 223 8000',
    email: 'keetmanshoop@ra.org.na'
  },
  {
    name: 'NATIS Keetmanshoop',
    address: 'Schmelen Street, Keetmanshoop',
    region: 'Karas',
    coordinates: {
      latitude: -26.5800,
      longitude: 18.1300
    },
    contactNumber: '+264 63 223 8111',
    email: 'keetmanshoop@natis.com.na'
  },
  
  // Kunene Region
  {
    name: 'Roads Authority Opuwo Office',
    address: 'Main Street, Opuwo',
    region: 'Kunene',
    coordinates: {
      latitude: -18.0606,
      longitude: 13.8400
    },
    contactNumber: '+264 65 273 9000',
    email: 'opuwo@ra.org.na'
  },
  
  // Ohangwena Region
  {
    name: 'NATIS Eenhana',
    address: 'Government Complex, Eenhana',
    region: 'Ohangwena',
    coordinates: {
      latitude: -17.4667,
      longitude: 16.3333
    },
    contactNumber: '+264 65 264 0111',
    email: 'eenhana@natis.com.na'
  }
];

async function populateOffices() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ra-app');
    console.log('Connected to MongoDB');

    // Clear existing locations (optional - comment out if you want to keep existing data)
    // await LocationModel.deleteMany({});
    // console.log('Cleared existing locations');

    // Insert sample offices
    const insertedOffices = await LocationModel.insertMany(sampleOffices);
    console.log(`Successfully inserted ${insertedOffices.length} sample offices`);

    // Display summary
    const regions = [...new Set(sampleOffices.map(office => office.region))];
    console.log('\nOffices by region:');
    for (const region of regions) {
      const count = sampleOffices.filter(office => office.region === region).length;
      console.log(`  ${region}: ${count} offices`);
    }

    console.log('\nSample data population completed successfully!');
  } catch (error) {
    console.error('Error populating sample offices:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
if (require.main === module) {
  populateOffices();
}

module.exports = { sampleOffices, populateOffices };