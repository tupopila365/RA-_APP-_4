"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const app_users_controller_1 = require("./app-users.controller");
const appAuth_1 = require("../../middlewares/appAuth");
const router = (0, express_1.Router)();
/**
 * @route   POST /api/app-users/register
 * @desc    Register a new app user
 * @access  Public
 */
router.post('/register', (req, res, next) => app_users_controller_1.appUsersController.register(req, res, next));
/**
 * @route   POST /api/app-users/login
 * @desc    Login app user
 * @access  Public
 */
router.post('/login', (req, res, next) => app_users_controller_1.appUsersController.login(req, res, next));
/**
 * @route   POST /api/app-users/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post('/refresh', (req, res, next) => app_users_controller_1.appUsersController.refresh(req, res, next));
/**
 * @route   POST /api/app-users/verify-email
 * @desc    Verify email with token
 * @access  Public
 */
router.post('/verify-email', (req, res, next) => app_users_controller_1.appUsersController.verifyEmail(req, res, next));
/**
 * @route   POST /api/app-users/resend-verification
 * @desc    Resend verification email
 * @access  Public
 */
router.post('/resend-verification', (req, res, next) => app_users_controller_1.appUsersController.resendVerificationEmail(req, res, next));
/**
 * @route   POST /api/app-users/logout
 * @desc    Logout app user
 * @access  Private
 */
router.post('/logout', appAuth_1.authenticateAppUser, (req, res, next) => app_users_controller_1.appUsersController.logout(req, res, next));
/**
 * @route   GET /api/app-users/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', appAuth_1.authenticateAppUser, (req, res, next) => app_users_controller_1.appUsersController.getMe(req, res, next));
/**
 * @route   PUT /api/app-users/me
 * @desc    Update user profile
 * @access  Private
 */
router.put('/me', appAuth_1.authenticateAppUser, (req, res, next) => app_users_controller_1.appUsersController.updateMe(req, res, next));
/**
 * @route   PUT /api/app-users/me/password
 * @desc    Change user password
 * @access  Private
 */
router.put('/me/password', appAuth_1.authenticateAppUser, (req, res, next) => app_users_controller_1.appUsersController.changePassword(req, res, next));
exports.default = router;
//# sourceMappingURL=app-users.routes.js.map