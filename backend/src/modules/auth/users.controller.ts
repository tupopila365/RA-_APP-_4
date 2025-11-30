import { Request, Response, NextFunction } from 'express';
import { usersService } from './users.service';

export class UsersController {
  /**
   * Create a new admin user
   * POST /api/users
   */
  async createUser(req: Request, res: Response, next: NextFunction): Promise<void> {
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

      const user = await usersService.createUser({
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
    } catch (error) {
      next(error);
    }
  }

  /**
   * List all admin users
   * GET /api/users
   */
  async listUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page, limit, role } = req.query;

      const result = await usersService.listUsers({
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        role: role as string,
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get a single user by ID
   * GET /api/users/:id
   */
  async getUserById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const user = await usersService.getUserById(id);

      res.status(200).json({
        success: true,
        data: {
          user,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update user details
   * PUT /api/users/:id
   */
  async updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { email, password, role, permissions } = req.body;

      const user = await usersService.updateUser(id, {
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
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a user
   * DELETE /api/users/:id
   */
  async deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const requestingUserId = (req as any).user?.userId;

      await usersService.deleteUser(id, requestingUserId);

      res.status(200).json({
        success: true,
        message: 'User deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Assign permissions to a user
   * POST /api/users/:id/permissions
   */
  async assignPermissions(req: Request, res: Response, next: NextFunction): Promise<void> {
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

      const user = await usersService.assignPermissions(id, permissions);

      res.status(200).json({
        success: true,
        data: {
          user,
        },
        message: 'Permissions assigned successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const usersController = new UsersController();
