import { Request, Response, NextFunction } from 'express';
import { AppAuthRequest } from '../../middlewares/appAuth';
export declare class AppUsersController {
    /**
     * Register a new app user
     * POST /api/app-users/register
     */
    register(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Login app user
     * POST /api/app-users/login
     */
    login(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Refresh access token
     * POST /api/app-users/refresh
     */
    refresh(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Logout app user
     * POST /api/app-users/logout
     */
    logout(req: AppAuthRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get current user profile
     * GET /api/app-users/me
     */
    getMe(req: AppAuthRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Update user profile
     * PUT /api/app-users/me
     */
    updateMe(req: AppAuthRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Change password
     * PUT /api/app-users/me/password
     */
    changePassword(req: AppAuthRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Verify email with token
     * POST /api/app-users/verify-email
     */
    verifyEmail(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Resend verification email
     * POST /api/app-users/resend-verification
     */
    resendVerificationEmail(req: Request, res: Response, next: NextFunction): Promise<void>;
}
export declare const appUsersController: AppUsersController;
//# sourceMappingURL=app-users.controller.d.ts.map