/**
 * Database Seeding Script
 *
 * Populates the database with sample data for development/testing
 */

import 'reflect-metadata';
import dotenv from 'dotenv';
import { connectDB, disconnectDB, AppDataSource } from '../config/db';
import { News } from '../modules/news/news.entity';
import { Location } from '../modules/locations/locations.entity';

dotenv.config();

// Sample News Data
const sampleNews = [
  {
    title: 'Road Safety Campaign Launched Nationwide',
    content:
      'The Roads Authority of Namibia has officially launched a nationwide road safety campaign aimed at reducing traffic accidents and promoting safer driving practices. The campaign will run for six months and includes educational programs in schools, community workshops, and increased enforcement of traffic regulations.',
    excerpt:
      'Roads Authority launches comprehensive road safety campaign across Namibia targeting pedestrian and driver awareness.',
    category: 'Safety',
    author: 'RA Communications',
    published: true,
    publishedAt: new Date('2024-01-15'),
    imageUrl: 'https://via.placeholder.com/800x400/00B4E6/FFFFFF?text=Road+Safety+Campaign',
  },
  {
    title: 'New Highway Project Connecting Major Cities',
    content:
      'The Roads Authority has announced a major infrastructure project that will see the construction of a new four-lane highway connecting Windhoek and Swakopmund. The N$2 billion project is expected to reduce travel time between the two cities by 30 minutes and significantly improve road safety.',
    excerpt:
      'Major highway expansion project to connect Windhoek and Swakopmund announced with N$2 billion investment.',
    category: 'Infrastructure',
    author: 'Infrastructure Team',
    published: true,
    publishedAt: new Date('2024-01-10'),
    imageUrl: 'https://via.placeholder.com/800x400/00B4E6/FFFFFF?text=Highway+Project',
  },
  {
    title: 'Maintenance Schedule Update for National Roads',
    content:
      'The Roads Authority has released an updated maintenance schedule for national roads across Namibia. The comprehensive maintenance program will address road surface repairs, pothole filling, and infrastructure upgrades on major routes.',
    excerpt:
      'Updated maintenance schedule for national roads released, affecting major routes across the country.',
    category: 'Maintenance',
    author: 'Maintenance Division',
    published: true,
    publishedAt: new Date('2024-01-05'),
    imageUrl: 'https://via.placeholder.com/800x400/00B4E6/FFFFFF?text=Road+Maintenance',
  },
];

// Sample Locations Data
const sampleLocations = [
  {
    name: 'Roads Authority Head Office',
    address: 'Faraday Street, Windhoek',
    region: 'Khomas',
    coordinates: {
      latitude: -22.5609,
      longitude: 17.0658,
    },
    contactNumber: '+264 61 284 7000',
    email: 'info@ra.org.na',
  },
  {
    name: 'NATIS Windhoek',
    address: 'Independence Avenue, Windhoek',
    region: 'Khomas',
    coordinates: {
      latitude: -22.57,
      longitude: 17.0836,
    },
    contactNumber: '+264 61 284 7100',
    email: 'natis@ra.org.na',
  },
  {
    name: 'Roads Authority Walvis Bay Office',
    address: 'Sam Nujoma Avenue, Walvis Bay',
    region: 'Erongo',
    coordinates: {
      latitude: -22.9575,
      longitude: 14.5053,
    },
    contactNumber: '+264 64 209 000',
    email: 'walvisbay@ra.org.na',
  },
  {
    name: 'Roads Authority Oshakati Office',
    address: 'Main Road, Oshakati',
    region: 'Oshana',
    coordinates: {
      latitude: -17.7833,
      longitude: 15.7,
    },
    contactNumber: '+264 65 220 000',
    email: 'oshakati@ra.org.na',
  },
];

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    await connectDB();
    console.log('✅ Connected to SQL Server');

    const newsRepo = AppDataSource.getRepository(News);
    const locationRepo = AppDataSource.getRepository(Location);

    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log('🗑️  Clearing existing data...');
    await newsRepo.clear();
    await locationRepo.clear();
    console.log('✅ Existing data cleared');

    // Insert sample news
    console.log('📰 Inserting sample news...');
    const newsEntities = newsRepo.create(sampleNews);
    const news = await newsRepo.save(newsEntities);
    console.log(`✅ Inserted ${news.length} news articles`);

    // Insert sample locations
    console.log('📍 Inserting sample locations...');
    const locationEntities = locationRepo.create(sampleLocations);
    const locations = await locationRepo.save(locationEntities);
    console.log(`✅ Inserted ${locations.length} locations`);

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - News articles: ${news.length}`);
    console.log(`   - Locations: ${locations.length}`);
    console.log('\n✨ You can now start the backend and mobile app!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await disconnectDB();
    console.log('\n👋 Disconnected from SQL Server');
    process.exit(0);
  }
}

seedDatabase();
