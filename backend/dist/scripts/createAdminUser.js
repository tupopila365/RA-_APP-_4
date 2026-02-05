"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const db_1 = require("../config/db");
const auth_entity_1 = require("../modules/auth/auth.entity");
const roles_1 = require("../constants/roles");
const logger_1 = require("../utils/logger");
/**
 * Script to create an initial super-admin user
 *
 * Usage: npx ts-node src/scripts/createAdminUser.ts
 */
const createAdminUser = async () => {
    try {
        await (0, db_1.connectDB)();
        logger_1.logger.info('Connected to SQL Server');
        const repo = db_1.AppDataSource.getRepository(auth_entity_1.User);
        const existingAdmin = await repo.findOne({ where: { email: 'admin@roadsauthority.na' } });
        if (existingAdmin) {
            logger_1.logger.info('Admin user already exists');
            logger_1.logger.info('Email: admin@roadsauthority.na');
            await (0, db_1.disconnectDB)();
            process.exit(0);
        }
        const adminUser = repo.create({
            email: 'admin@roadsauthority.na',
            password: 'Admin@123',
            role: roles_1.ROLES.SUPER_ADMIN,
            permissions: Object.values(roles_1.PERMISSIONS),
        });
        await repo.save(adminUser);
        logger_1.logger.info('✅ Super-admin user created successfully!');
        logger_1.logger.info('');
        logger_1.logger.info('Login credentials:');
        logger_1.logger.info('  Email: admin@roadsauthority.na');
        logger_1.logger.info('  Password: Admin@123');
        logger_1.logger.info('');
        logger_1.logger.info('⚠️  Please change the password after first login!');
        await (0, db_1.disconnectDB)();
        process.exit(0);
    }
    catch (error) {
        logger_1.logger.error('Error creating admin user:', error);
        await (0, db_1.disconnectDB)().catch(() => { });
        process.exit(1);
    }
};
createAdminUser();
//# sourceMappingURL=createAdminUser.js.map