"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("./auth.controller");
const auth_1 = require("../../middlewares/auth");
const router = (0, express_1.Router)();
/**
 * @route   POST /api/auth/login
 * @desc    Login with email and password
 * @access  Public
 */
router.post('/login', (req, res, next) => auth_controller_1.authController.login(req, res, next));
/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token using refresh token
 * @access  Public
 */
router.post('/refresh', (req, res, next) => auth_controller_1.authController.refresh(req, res, next));
/**
 * @route   POST /api/auth/logout
 * @desc    Logout user and invalidate refresh token
 * @access  Private
 */
router.post('/logout', auth_1.authenticate, (req, res, next) => auth_controller_1.authController.logout(req, res, next));
exports.default = router;
//# sourceMappingURL=auth.routes.js.map