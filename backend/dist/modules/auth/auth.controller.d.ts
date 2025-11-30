import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../../middlewares/auth';
export declare class AuthController {
    /**
     * POST /api/auth/login
     * Login with email and password
     */
    login(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * POST /api/auth/refresh
     * Refresh access token using refresh token
     */
    refresh(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * POST /api/auth/logout
     * Logout user by invalidating refresh token
     */
    logout(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
}
export declare const authController: AuthController;
//# sourceMappingURL=auth.controller.d.ts.map