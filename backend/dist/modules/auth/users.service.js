"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usersService = exports.UsersService = void 0;
const db_1 = require("../../config/db");
const auth_entity_1 = require("./auth.entity");
const logger_1 = require("../../utils/logger");
const errors_1 = require("../../constants/errors");
const roles_1 = require("../../constants/roles");
class UsersService {
    /**
     * Create a new admin user
     */
    async createUser(data) {
        const { email, password, role, permissions } = data;
        const repo = db_1.AppDataSource.getRepository(auth_entity_1.User);
        // Validate role
        if (!(0, roles_1.isValidRole)(role)) {
            throw {
                code: errors_1.ERROR_CODES.VALIDATION_ERROR,
                message: `Invalid role: ${role}. Must be 'super-admin' or 'admin'`,
                statusCode: 400,
            };
        }
        // Validate permissions
        const invalidPermissions = permissions.filter(p => !(0, roles_1.isValidPermission)(p));
        if (invalidPermissions.length > 0) {
            throw {
                code: errors_1.ERROR_CODES.VALIDATION_ERROR,
                message: `Invalid permissions: ${invalidPermissions.join(', ')}`,
                statusCode: 400,
            };
        }
        // Check if user already exists
        const existingUser = await repo.findOne({ where: { email: email.toLowerCase().trim() } });
        if (existingUser) {
            throw {
                code: errors_1.ERROR_CODES.VALIDATION_ERROR,
                message: 'User with this email already exists',
                statusCode: 409,
            };
        }
        // Create user
        const user = repo.create({
            email: email.toLowerCase().trim(),
            password,
            role: role,
            permissions: permissions,
        });
        await repo.save(user);
        logger_1.logger.info(`New user created: ${user.email} with role: ${user.role}`);
        const { password: _, ...rest } = user;
        return rest;
    }
    /**
     * List all admin users with pagination
     */
    async listUsers(query) {
        const page = Math.max(1, query.page || 1);
        const limit = Math.min(100, Math.max(1, query.limit || 10));
        const skip = (page - 1) * limit;
        const repo = db_1.AppDataSource.getRepository(auth_entity_1.User);
        const where = {};
        if (query.role && (0, roles_1.isValidRole)(query.role)) {
            where.role = query.role;
        }
        const [users, total] = await Promise.all([
            repo.find({
                where,
                order: { createdAt: 'DESC' },
                skip,
                take: limit,
                select: ['id', 'email', 'role', 'permissions', 'createdAt', 'updatedAt'],
            }),
            repo.count({ where }),
        ]);
        const totalPages = Math.ceil(total / limit);
        logger_1.logger.debug(`Listed ${users.length} users (page ${page} of ${totalPages})`);
        return { users, total, page, limit, totalPages };
    }
    /**
     * Get a single user by ID
     */
    async getUserById(userId) {
        const id = parseInt(userId, 10);
        const repo = db_1.AppDataSource.getRepository(auth_entity_1.User);
        const user = await repo.findOne({
            where: { id },
            select: ['id', 'email', 'role', 'permissions', 'createdAt', 'updatedAt'],
        });
        if (!user) {
            throw {
                code: errors_1.ERROR_CODES.NOT_FOUND,
                message: 'User not found',
                statusCode: 404,
            };
        }
        return user;
    }
    /**
     * Update user details
     */
    async updateUser(userId, data) {
        const id = parseInt(userId, 10);
        const repo = db_1.AppDataSource.getRepository(auth_entity_1.User);
        if (data.role && !(0, roles_1.isValidRole)(data.role)) {
            throw {
                code: errors_1.ERROR_CODES.VALIDATION_ERROR,
                message: `Invalid role: ${data.role}. Must be 'super-admin' or 'admin'`,
                statusCode: 400,
            };
        }
        if (data.permissions) {
            const invalidPermissions = data.permissions.filter(p => !(0, roles_1.isValidPermission)(p));
            if (invalidPermissions.length > 0) {
                throw {
                    code: errors_1.ERROR_CODES.VALIDATION_ERROR,
                    message: `Invalid permissions: ${invalidPermissions.join(', ')}`,
                    statusCode: 400,
                };
            }
        }
        if (data.email) {
            const existingUser = await repo.findOne({
                where: { email: data.email.toLowerCase().trim() },
            });
            if (existingUser && existingUser.id !== id) {
                throw {
                    code: errors_1.ERROR_CODES.VALIDATION_ERROR,
                    message: 'Email already in use by another user',
                    statusCode: 409,
                };
            }
        }
        const user = await repo.findOne({ where: { id } });
        if (!user) {
            throw {
                code: errors_1.ERROR_CODES.NOT_FOUND,
                message: 'User not found',
                statusCode: 404,
            };
        }
        if (data.email)
            user.email = data.email.toLowerCase().trim();
        if (data.password)
            user.password = data.password;
        if (data.role)
            user.role = data.role;
        if (data.permissions)
            user.permissions = data.permissions;
        await repo.save(user);
        logger_1.logger.info(`User updated: ${user.email}`);
        const { password: _, ...rest } = user;
        return rest;
    }
    /**
     * Delete a user
     */
    async deleteUser(userId, requestingUserId) {
        if (userId === requestingUserId) {
            throw {
                code: errors_1.ERROR_CODES.VALIDATION_ERROR,
                message: 'Cannot delete your own account',
                statusCode: 400,
            };
        }
        const id = parseInt(userId, 10);
        const repo = db_1.AppDataSource.getRepository(auth_entity_1.User);
        const user = await repo.findOne({ where: { id } });
        if (!user) {
            throw {
                code: errors_1.ERROR_CODES.NOT_FOUND,
                message: 'User not found',
                statusCode: 404,
            };
        }
        await repo.remove(user);
        logger_1.logger.info(`User deleted: ${user.email}`);
    }
    /**
     * Assign permissions to a user
     */
    async assignPermissions(userId, permissions) {
        const invalidPermissions = permissions.filter(p => !(0, roles_1.isValidPermission)(p));
        if (invalidPermissions.length > 0) {
            throw {
                code: errors_1.ERROR_CODES.VALIDATION_ERROR,
                message: `Invalid permissions: ${invalidPermissions.join(', ')}`,
                statusCode: 400,
            };
        }
        const id = parseInt(userId, 10);
        const repo = db_1.AppDataSource.getRepository(auth_entity_1.User);
        const user = await repo.findOne({ where: { id } });
        if (!user) {
            throw {
                code: errors_1.ERROR_CODES.NOT_FOUND,
                message: 'User not found',
                statusCode: 404,
            };
        }
        user.permissions = permissions;
        await repo.save(user);
        logger_1.logger.info(`Permissions updated for user: ${user.email}`);
        const { password: _, ...rest } = user;
        return rest;
    }
}
exports.UsersService = UsersService;
exports.usersService = new UsersService();
//# sourceMappingURL=users.service.js.map