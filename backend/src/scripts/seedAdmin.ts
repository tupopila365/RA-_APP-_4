import 'reflect-metadata';
import { connectDB, disconnectDB } from '../config/db';
import { User } from '../modules/auth/auth.entity';
import { AppDataSource } from '../config/db';

async function seedAdmin() {
  try {
    await connectDB();

    const repo = AppDataSource.getRepository(User);
    const adminExists = await repo.findOne({ where: { email: 'admin@roadsauthority.na' } });
    if (adminExists) {
      console.log('Admin user already exists');
      await disconnectDB();
      return;
    }

    const admin = repo.create({
      email: 'admin@roadsauthority.na',
      password: 'Admin123!',
      role: 'super-admin',
    });

    await repo.save(admin);
    console.log('Admin user created successfully');
  } catch (error) {
    console.error('Error seeding admin:', error);
  } finally {
    await disconnectDB();
  }
}

seedAdmin();
