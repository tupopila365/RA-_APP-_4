import mongoose from 'mongoose';
import { User } from '../modules/auth/auth.model';
import { connectDB } from '../config/db';

async function seedAdmin() {
  try {
    await connectDB();
    
    const adminExists = await User.findOne({ email: 'admin@roadsauthority.na' });
    if (adminExists) {
      console.log('Admin user already exists');
      return;
    }

    const admin = new User({
      email: 'admin@roadsauthority.na',
      password: 'Admin123!', // Will be hashed by pre-save hook
      role: 'superadmin',
    });

    await admin.save();
    console.log('Admin user created successfully');
  } catch (error) {
    console.error('Error seeding admin:', error);
  } finally {
    mongoose.connection.close();
  }
}

seedAdmin();