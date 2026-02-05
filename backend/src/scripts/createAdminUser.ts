import 'reflect-metadata';
import { connectDB, disconnectDB, AppDataSource } from '../config/db';
import { User } from '../modules/auth/auth.entity';
import { ROLES, PERMISSIONS } from '../constants/roles';
import { logger } from '../utils/logger';

/**
 * Script to create an initial super-admin user
 *
 * Usage: npx ts-node src/scripts/createAdminUser.ts
 */

const createAdminUser = async () => {
  try {
    await connectDB();
    logger.info('Connected to SQL Server');

    const repo = AppDataSource.getRepository(User);
    const existingAdmin = await repo.findOne({ where: { email: 'admin@roadsauthority.na' } });

    if (existingAdmin) {
      logger.info('Admin user already exists');
      logger.info('Email: admin@roadsauthority.na');
      await disconnectDB();
      process.exit(0);
    }

    const adminUser = repo.create({
      email: 'admin@roadsauthority.na',
      password: 'Admin@123',
      role: ROLES.SUPER_ADMIN,
      permissions: Object.values(PERMISSIONS),
    });

    await repo.save(adminUser);

    logger.info('✅ Super-admin user created successfully!');
    logger.info('');
    logger.info('Login credentials:');
    logger.info('  Email: admin@roadsauthority.na');
    logger.info('  Password: Admin@123');
    logger.info('');
    logger.info('⚠️  Please change the password after first login!');

    await disconnectDB();
    process.exit(0);
  } catch (error) {
    logger.error('Error creating admin user:', error);
    await disconnectDB().catch(() => {});
    process.exit(1);
  }
};

createAdminUser();
