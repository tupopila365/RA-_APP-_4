"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usersController = exports.UsersController = void 0;
const users_service_1 = require("./users.service");
class UsersController {
    /**
     * Create a new admin user
     * POST /api/users
     */
    async createUser(req, res, next) {
        try {
            const { email, password, role, permissions } = req.body;
            // Validate required fields
            if (!email || !password || !role) {
                res.status(400).json({
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'Email, password, and role are required',
                    },
                });
                return;
            }
            const user = await users_service_1.usersService.createUser({
                email,
                password,
                role,
                permissions: permissions || [],
            });
            res.status(201).json({
                success: true,
                data: {
                    user,
                },
                message: 'User created successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * List all admin users
     * GET /api/users
     */
    async listUsers(req, res, next) {
        try {
            const { page, limit, role } = req.query;
            const result = await users_service_1.usersService.listUsers({
                page: page ? parseInt(page) : undefined,
                limit: limit ? parseInt(limit) : undefined,
                role: role,
            });
            res.status(200).json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Get a single user by ID
     * GET /api/users/:id
     */
    async getUserById(req, res, next) {
        try {
            const { id } = req.params;
            const user = await users_service_1.usersService.getUserById(id);
            res.status(200).json({
                success: true,
                data: {
                    user,
                },
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Update user details
     * PUT /api/users/:id
     */
    async updateUser(req, res, next) {
        try {
            const { id } = req.params;
            const { email, password, role, permissions } = req.body;
            const user = await users_service_1.usersService.updateUser(id, {
                email,
                password,
                role,
                permissions,
            });
            res.status(200).json({
                success: true,
                data: {
                    user,
                },
                message: 'User updated successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Delete a user
     * DELETE /api/users/:id
     */
    async deleteUser(req, res, next) {
        try {
            const { id } = req.params;
            const requestingUserId = req.user?.userId;
            await users_service_1.usersService.deleteUser(id, requestingUserId);
            res.status(200).json({
                success: true,
                message: 'User deleted successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Assign permissions to a user
     * POST /api/users/:id/permissions
     */
    async assignPermissions(req, res, next) {
        try {
            const { id } = req.params;
            const { permissions } = req.body;
            if (!permissions || !Array.isArray(permissions)) {
                res.status(400).json({
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'Permissions array is required',
                    },
                });
                return;
            }
            const user = await users_service_1.usersService.assignPermissions(id, permissions);
            res.status(200).json({
                success: true,
                data: {
                    user,
                },
                message: 'Permissions assigned successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.UsersController = UsersController;
exports.usersController = new UsersController();
//# sourceMappingURL=users.controller.js.map