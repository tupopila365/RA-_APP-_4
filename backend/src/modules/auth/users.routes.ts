import { Router } from 'express';
import { usersController } from './users.controller';
import { authenticate } from '../../middlewares/auth';
import { requirePermission } from '../../middlewares/roleGuard';
import { PERMISSIONS } from '../../constants/roles';

const router = Router();

// All user management routes require authentication and users:manage permission (super-admin only)
router.use(authenticate);
router.use(requirePermission(PERMISSIONS.USERS_MANAGE));

/**
 * @route   POST /api/users
 * @desc    Create a new admin user
 * @access  Super-admin only
 */
router.post('/', usersController.createUser.bind(usersController));

/**
 * @route   GET /api/users
 * @desc    List all admin users with pagination
 * @access  Super-admin only
 */
router.get('/', usersController.listUsers.bind(usersController));

/**
 * @route   GET /api/users/:id
 * @desc    Get a single user by ID
 * @access  Super-admin only
 */
router.get('/:id', usersController.getUserById.bind(usersController));

/**
 * @route   PUT /api/users/:id
 * @desc    Update user details
 * @access  Super-admin only
 */
router.put('/:id', usersController.updateUser.bind(usersController));

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete a user
 * @access  Super-admin only
 */
router.delete('/:id', usersController.deleteUser.bind(usersController));

/**
 * @route   POST /api/users/:id/permissions
 * @desc    Assign permissions to a user
 * @access  Super-admin only
 */
router.post('/:id/permissions', usersController.assignPermissions.bind(usersController));

export default router;
