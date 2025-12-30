import { Router } from 'express';
import { appUsersController } from './app-users.controller';
import { authenticateAppUser } from '../../middlewares/appAuth';

const router = Router();

/**
 * @route   POST /api/app-users/register
 * @desc    Register a new app user
 * @access  Public
 */
router.post('/register', (req, res, next) => appUsersController.register(req, res, next));

/**
 * @route   POST /api/app-users/login
 * @desc    Login app user
 * @access  Public
 */
router.post('/login', (req, res, next) => appUsersController.login(req, res, next));

/**
 * @route   POST /api/app-users/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post('/refresh', (req, res, next) => appUsersController.refresh(req, res, next));

/**
 * @route   POST /api/app-users/verify-email
 * @desc    Verify email with token
 * @access  Public
 */
router.post('/verify-email', (req, res, next) => appUsersController.verifyEmail(req, res, next));

/**
 * @route   POST /api/app-users/resend-verification
 * @desc    Resend verification email
 * @access  Public
 */
router.post('/resend-verification', (req, res, next) => appUsersController.resendVerificationEmail(req, res, next));

/**
 * @route   POST /api/app-users/logout
 * @desc    Logout app user
 * @access  Private
 */
router.post('/logout', authenticateAppUser, (req, res, next) => appUsersController.logout(req, res, next));

/**
 * @route   GET /api/app-users/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', authenticateAppUser, (req, res, next) => appUsersController.getMe(req, res, next));

/**
 * @route   PUT /api/app-users/me
 * @desc    Update user profile
 * @access  Private
 */
router.put('/me', authenticateAppUser, (req, res, next) => appUsersController.updateMe(req, res, next));

/**
 * @route   PUT /api/app-users/me/password
 * @desc    Change user password
 * @access  Private
 */
router.put('/me/password', authenticateAppUser, (req, res, next) => appUsersController.changePassword(req, res, next));

export default router;

