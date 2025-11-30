import { connectDB } from '../config/db';
import { User } from '../modules/auth/auth.model';
import { ROLES, PERMISSIONS } from '../constants/roles';
import { logger } from '../utils/logger';

/**
 * Script to create an initial super-admin user
 * 
 * Usage: npx ts-node src/scripts/createAdminUser.ts
 */

const createAdminUser = async () => {
  try {
    // Connect to database
    await connectDB();
    logger.info('Connected to MongoDB');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: 'admin@roadsauthority.na' });
    
    if (existingAdmin) {
      logger.info('Admin user already exists');
      logger.info(`Email: admin@roadsauthority.na`);
      process.exit(0);
    }

    // Create super-admin user
    const adminUser = new User({
      email: 'admin@roadsauthority.na',
      password: 'Admin@123', // Will be hashed by the model
      firstName: 'Super',
      lastName: 'Admin',
      role: ROLES.SUPER_ADMIN,
      permissions: Object.values(PERMISSIONS), // All permissions
      isActive: true,
    });

    await adminUser.save();

    logger.info('✅ Super-admin user created successfully!');
    logger.info('');
    logger.info('Login credentials:');
    logger.info('  Email: admin@roadsauthority.na');
    logger.info('  Password: Admin@123');
    logger.info('');
    logger.info('⚠️  Please change the password after first login!');

    process.exit(0);
  } catch (error) {
    logger.error('Error creating admin user:', error);
    process.exit(1);
  }
};

createAdminUser();
