"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const users_controller_1 = require("./users.controller");
const auth_1 = require("../../middlewares/auth");
const roleGuard_1 = require("../../middlewares/roleGuard");
const roles_1 = require("../../constants/roles");
const router = (0, express_1.Router)();
// All user management routes require authentication and users:manage permission (super-admin only)
router.use(auth_1.authenticate);
router.use((0, roleGuard_1.requirePermission)(roles_1.PERMISSIONS.USERS_MANAGE));
/**
 * @route   POST /api/users
 * @desc    Create a new admin user
 * @access  Super-admin only
 */
router.post('/', users_controller_1.usersController.createUser.bind(users_controller_1.usersController));
/**
 * @route   GET /api/users
 * @desc    List all admin users with pagination
 * @access  Super-admin only
 */
router.get('/', users_controller_1.usersController.listUsers.bind(users_controller_1.usersController));
/**
 * @route   GET /api/users/:id
 * @desc    Get a single user by ID
 * @access  Super-admin only
 */
router.get('/:id', users_controller_1.usersController.getUserById.bind(users_controller_1.usersController));
/**
 * @route   PUT /api/users/:id
 * @desc    Update user details
 * @access  Super-admin only
 */
router.put('/:id', users_controller_1.usersController.updateUser.bind(users_controller_1.usersController));
/**
 * @route   DELETE /api/users/:id
 * @desc    Delete a user
 * @access  Super-admin only
 */
router.delete('/:id', users_controller_1.usersController.deleteUser.bind(users_controller_1.usersController));
/**
 * @route   POST /api/users/:id/permissions
 * @desc    Assign permissions to a user
 * @access  Super-admin only
 */
router.post('/:id/permissions', users_controller_1.usersController.assignPermissions.bind(users_controller_1.usersController));
exports.default = router;
//# sourceMappingURL=users.routes.js.map