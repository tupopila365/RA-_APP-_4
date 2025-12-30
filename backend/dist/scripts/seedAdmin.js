"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const auth_model_1 = require("../modules/auth/auth.model");
const db_1 = require("../config/db");
async function seedAdmin() {
    try {
        await (0, db_1.connectDB)();
        const adminExists = await auth_model_1.User.findOne({ email: 'admin@roadsauthority.na' });
        if (adminExists) {
            console.log('Admin user already exists');
            return;
        }
        const admin = new auth_model_1.User({
            email: 'admin@roadsauthority.na',
            password: 'Admin123!', // Will be hashed by pre-save hook
            role: 'superadmin',
        });
        await admin.save();
        console.log('Admin user created successfully');
    }
    catch (error) {
        console.error('Error seeding admin:', error);
    }
    finally {
        mongoose_1.default.connection.close();
    }
}
seedAdmin();
//# sourceMappingURL=seedAdmin.js.map