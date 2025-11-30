"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../config/db");
const auth_model_1 = require("../modules/auth/auth.model");
const roles_1 = require("../constants/roles");
const logger_1 = require("../utils/logger");
/**
 * Script to create an initial super-admin user
 *
 * Usage: npx ts-node src/scripts/createAdminUser.ts
 */
const createAdminUser = async () => {
    try {
        // Connect to database
        await (0, db_1.connectDB)();
        logger_1.logger.info('Connected to MongoDB');
        // Check if admin user already exists
        const existingAdmin = await auth_model_1.User.findOne({ email: 'admin@roadsauthority.na' });
        if (existingAdmin) {
            logger_1.logger.info('Admin user already exists');
            logger_1.logger.info(`Email: admin@roadsauthority.na`);
            process.exit(0);
        }
        // Create super-admin user
        const adminUser = new auth_model_1.User({
            email: 'admin@roadsauthority.na',
            password: 'Admin@123', // Will be hashed by the model
            firstName: 'Super',
            lastName: 'Admin',
            role: roles_1.ROLES.SUPER_ADMIN,
            permissions: Object.values(roles_1.PERMISSIONS), // All permissions
            isActive: true,
        });
        await adminUser.save();
        logger_1.logger.info('✅ Super-admin user created successfully!');
        logger_1.logger.info('');
        logger_1.logger.info('Login credentials:');
        logger_1.logger.info('  Email: admin@roadsauthority.na');
        logger_1.logger.info('  Password: Admin@123');
        logger_1.logger.info('');
        logger_1.logger.info('⚠️  Please change the password after first login!');
        process.exit(0);
    }
    catch (error) {
        logger_1.logger.error('Error creating admin user:', error);
        process.exit(1);
    }
};
createAdminUser();
//# sourceMappingURL=createAdminUser.js.map