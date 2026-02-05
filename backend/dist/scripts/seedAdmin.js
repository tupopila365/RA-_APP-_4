"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const db_1 = require("../config/db");
const auth_entity_1 = require("../modules/auth/auth.entity");
const db_2 = require("../config/db");
async function seedAdmin() {
    try {
        await (0, db_1.connectDB)();
        const repo = db_2.AppDataSource.getRepository(auth_entity_1.User);
        const adminExists = await repo.findOne({ where: { email: 'admin@roadsauthority.na' } });
        if (adminExists) {
            console.log('Admin user already exists');
            await (0, db_1.disconnectDB)();
            return;
        }
        const admin = repo.create({
            email: 'admin@roadsauthority.na',
            password: 'Admin123!',
            role: 'super-admin',
        });
        await repo.save(admin);
        console.log('Admin user created successfully');
    }
    catch (error) {
        console.error('Error seeding admin:', error);
    }
    finally {
        await (0, db_1.disconnectDB)();
    }
}
seedAdmin();
//# sourceMappingURL=seedAdmin.js.map