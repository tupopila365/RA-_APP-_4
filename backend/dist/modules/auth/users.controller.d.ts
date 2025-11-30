import { Request, Response, NextFunction } from 'express';
export declare class UsersController {
    /**
     * Create a new admin user
     * POST /api/users
     */
    createUser(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * List all admin users
     * GET /api/users
     */
    listUsers(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get a single user by ID
     * GET /api/users/:id
     */
    getUserById(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Update user details
     * PUT /api/users/:id
     */
    updateUser(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Delete a user
     * DELETE /api/users/:id
     */
    deleteUser(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Assign permissions to a user
     * POST /api/users/:id/permissions
     */
    assignPermissions(req: Request, res: Response, next: NextFunction): Promise<void>;
}
export declare const usersController: UsersController;
//# sourceMappingURL=users.controller.d.ts.map