import { Router } from 'express';
import { authController } from './auth.controller';
import { authenticate } from '../../middlewares/auth';

const router = Router();

/**
 * @route   POST /api/auth/login
 * @desc    Login with email and password
 * @access  Public
 */
router.post('/login', (req, res, next) => authController.login(req, res, next));

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token using refresh token
 * @access  Public
 */
router.post('/refresh', (req, res, next) => authController.refresh(req, res, next));

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user and invalidate refresh token
 * @access  Private
 */
router.post('/logout', authenticate, (req, res, next) => authController.logout(req, res, next));

export default router;
