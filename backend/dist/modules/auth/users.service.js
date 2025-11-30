"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usersService = exports.UsersService = void 0;
const auth_model_1 = require("./auth.model");
const logger_1 = require("../../utils/logger");
const errors_1 = require("../../constants/errors");
const roles_1 = require("../../constants/roles");
class UsersService {
    /**
     * Create a new admin user
     */
    async createUser(data) {
        const { email, password, role, permissions } = data;
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
        const existingUser = await auth_model_1.User.findOne({ email });
        if (existingUser) {
            throw {
                code: errors_1.ERROR_CODES.VALIDATION_ERROR,
                message: 'User with this email already exists',
                statusCode: 409,
            };
        }
        // Create user
        const user = new auth_model_1.User({
            email,
            password,
            role,
            permissions,
        });
        await user.save();
        logger_1.logger.info(`New user created: ${user.email} with role: ${user.role}`);
        // Return user without password
        const userObject = user.toObject();
        delete userObject.password;
        return userObject;
    }
    /**
     * List all admin users with pagination
     */
    async listUsers(query) {
        const page = Math.max(1, query.page || 1);
        const limit = Math.min(100, Math.max(1, query.limit || 10));
        const skip = (page - 1) * limit;
        // Build filter
        const filter = {};
        if (query.role && (0, roles_1.isValidRole)(query.role)) {
            filter.role = query.role;
        }
        // Get users with pagination
        const [users, total] = await Promise.all([
            auth_model_1.User.find(filter)
                .select('-password')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            auth_model_1.User.countDocuments(filter),
        ]);
        const totalPages = Math.ceil(total / limit);
        logger_1.logger.debug(`Listed ${users.length} users (page ${page} of ${totalPages})`);
        return {
            users: users,
            total,
            page,
            limit,
            totalPages,
        };
    }
    /**
     * Get a single user by ID
     */
    async getUserById(userId) {
        const user = await auth_model_1.User.findById(userId).select('-password').lean();
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
        // Validate role if provided
        if (data.role && !(0, roles_1.isValidRole)(data.role)) {
            throw {
                code: errors_1.ERROR_CODES.VALIDATION_ERROR,
                message: `Invalid role: ${data.role}. Must be 'super-admin' or 'admin'`,
                statusCode: 400,
            };
        }
        // Validate permissions if provided
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
        // Check if email is being changed and if it's already taken
        if (data.email) {
            const existingUser = await auth_model_1.User.findOne({
                email: data.email,
                _id: { $ne: userId }
            });
            if (existingUser) {
                throw {
                    code: errors_1.ERROR_CODES.VALIDATION_ERROR,
                    message: 'Email already in use by another user',
                    statusCode: 409,
                };
            }
        }
        // Find and update user
        const user = await auth_model_1.User.findById(userId);
        if (!user) {
            throw {
                code: errors_1.ERROR_CODES.NOT_FOUND,
                message: 'User not found',
                statusCode: 404,
            };
        }
        // Update fields
        if (data.email)
            user.email = data.email;
        if (data.password)
            user.password = data.password; // Will be hashed by pre-save hook
        if (data.role)
            user.role = data.role;
        if (data.permissions)
            user.permissions = data.permissions;
        await user.save();
        logger_1.logger.info(`User updated: ${user.email}`);
        // Return user without password
        const userObject = user.toObject();
        delete userObject.password;
        return userObject;
    }
    /**
     * Delete a user
     */
    async deleteUser(userId, requestingUserId) {
        // Prevent self-deletion
        if (userId === requestingUserId) {
            throw {
                code: errors_1.ERROR_CODES.VALIDATION_ERROR,
                message: 'Cannot delete your own account',
                statusCode: 400,
            };
        }
        const user = await auth_model_1.User.findById(userId);
        if (!user) {
            throw {
                code: errors_1.ERROR_CODES.NOT_FOUND,
                message: 'User not found',
                statusCode: 404,
            };
        }
        await auth_model_1.User.findByIdAndDelete(userId);
        logger_1.logger.info(`User deleted: ${user.email}`);
    }
    /**
     * Assign permissions to a user
     */
    async assignPermissions(userId, permissions) {
        // Validate permissions
        const invalidPermissions = permissions.filter(p => !(0, roles_1.isValidPermission)(p));
        if (invalidPermissions.length > 0) {
            throw {
                code: errors_1.ERROR_CODES.VALIDATION_ERROR,
                message: `Invalid permissions: ${invalidPermissions.join(', ')}`,
                statusCode: 400,
            };
        }
        const user = await auth_model_1.User.findById(userId);
        if (!user) {
            throw {
                code: errors_1.ERROR_CODES.NOT_FOUND,
                message: 'User not found',
                statusCode: 404,
            };
        }
        user.permissions = permissions;
        await user.save();
        logger_1.logger.info(`Permissions updated for user: ${user.email}`);
        // Return user without password
        const userObject = user.toObject();
        delete userObject.password;
        return userObject;
    }
}
exports.UsersService = UsersService;
exports.usersService = new UsersService();
//# sourceMappingURL=users.service.js.map