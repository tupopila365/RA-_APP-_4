import { AppDataSource } from '../../config/db';
import { User } from './auth.entity';
import { logger } from '../../utils/logger';
import { ERROR_CODES } from '../../constants/errors';
import { isValidRole, isValidPermission, Permission } from '../../constants/roles';

interface CreateUserDto {
  email: string;
  password: string;
  role: string;
  permissions: string[];
}

interface UpdateUserDto {
  email?: string;
  password?: string;
  role?: string;
  permissions?: string[];
}

interface ListUsersQuery {
  page?: number;
  limit?: number;
  role?: string;
}

export class UsersService {
  /**
   * Create a new admin user
   */
  async createUser(data: CreateUserDto): Promise<User> {
    const { email, password, role, permissions } = data;
    const repo = AppDataSource.getRepository(User);

    // Validate role
    if (!isValidRole(role)) {
      throw {
        code: ERROR_CODES.VALIDATION_ERROR,
        message: `Invalid role: ${role}. Must be 'super-admin' or 'admin'`,
        statusCode: 400,
      };
    }

    // Validate permissions
    const invalidPermissions = permissions.filter(p => !isValidPermission(p));
    if (invalidPermissions.length > 0) {
      throw {
        code: ERROR_CODES.VALIDATION_ERROR,
        message: `Invalid permissions: ${invalidPermissions.join(', ')}`,
        statusCode: 400,
      };
    }

    // Check if user already exists
    const existingUser = await repo.findOne({ where: { email: email.toLowerCase().trim() } });
    if (existingUser) {
      throw {
        code: ERROR_CODES.VALIDATION_ERROR,
        message: 'User with this email already exists',
        statusCode: 409,
      };
    }

    // Create user
    const user = repo.create({
      email: email.toLowerCase().trim(),
      password,
      role: role as any,
      permissions: permissions as Permission[],
    });
    await repo.save(user);

    logger.info(`New user created: ${user.email} with role: ${user.role}`);

    const { password: _, ...rest } = user;
    return rest as User;
  }

  /**
   * List all admin users with pagination
   */
  async listUsers(query: ListUsersQuery): Promise<{
    users: User[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 10));
    const skip = (page - 1) * limit;
    const repo = AppDataSource.getRepository(User);

    const where: any = {};
    if (query.role && isValidRole(query.role)) {
      where.role = query.role;
    }

    const [users, total] = await Promise.all([
      repo.find({
        where,
        order: { createdAt: 'DESC' },
        skip,
        take: limit,
        select: ['id', 'email', 'role', 'permissions', 'createdAt', 'updatedAt'],
      }),
      repo.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);
    logger.debug(`Listed ${users.length} users (page ${page} of ${totalPages})`);

    return { users, total, page, limit, totalPages };
  }

  /**
   * Get a single user by ID
   */
  async getUserById(userId: string): Promise<User> {
    const id = parseInt(userId, 10);
    const repo = AppDataSource.getRepository(User);
    const user = await repo.findOne({
      where: { id },
      select: ['id', 'email', 'role', 'permissions', 'createdAt', 'updatedAt'],
    });

    if (!user) {
      throw {
        code: ERROR_CODES.NOT_FOUND,
        message: 'User not found',
        statusCode: 404,
      };
    }

    return user;
  }

  /**
   * Update user details
   */
  async updateUser(userId: string, data: UpdateUserDto): Promise<User> {
    const id = parseInt(userId, 10);
    const repo = AppDataSource.getRepository(User);

    if (data.role && !isValidRole(data.role)) {
      throw {
        code: ERROR_CODES.VALIDATION_ERROR,
        message: `Invalid role: ${data.role}. Must be 'super-admin' or 'admin'`,
        statusCode: 400,
      };
    }

    if (data.permissions) {
      const invalidPermissions = data.permissions.filter(p => !isValidPermission(p));
      if (invalidPermissions.length > 0) {
        throw {
          code: ERROR_CODES.VALIDATION_ERROR,
          message: `Invalid permissions: ${invalidPermissions.join(', ')}`,
          statusCode: 400,
        };
      }
    }

    if (data.email) {
      const existingUser = await repo.findOne({
        where: { email: data.email.toLowerCase().trim() },
      });
      if (existingUser && existingUser.id !== id) {
        throw {
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Email already in use by another user',
          statusCode: 409,
        };
      }
    }

    const user = await repo.findOne({ where: { id } });
    if (!user) {
      throw {
        code: ERROR_CODES.NOT_FOUND,
        message: 'User not found',
        statusCode: 404,
      };
    }

    if (data.email) user.email = data.email.toLowerCase().trim();
    if (data.password) user.password = data.password;
    if (data.role) user.role = data.role as any;
    if (data.permissions) user.permissions = data.permissions as Permission[];
    await repo.save(user);

    logger.info(`User updated: ${user.email}`);
    const { password: _, ...rest } = user;
    return rest as User;
  }

  /**
   * Delete a user
   */
  async deleteUser(userId: string, requestingUserId: string): Promise<void> {
    if (userId === requestingUserId) {
      throw {
        code: ERROR_CODES.VALIDATION_ERROR,
        message: 'Cannot delete your own account',
        statusCode: 400,
      };
    }

    const id = parseInt(userId, 10);
    const repo = AppDataSource.getRepository(User);
    const user = await repo.findOne({ where: { id } });

    if (!user) {
      throw {
        code: ERROR_CODES.NOT_FOUND,
        message: 'User not found',
        statusCode: 404,
      };
    }

    await repo.remove(user);
    logger.info(`User deleted: ${user.email}`);
  }

  /**
   * Assign permissions to a user
   */
  async assignPermissions(userId: string, permissions: string[]): Promise<User> {
    const invalidPermissions = permissions.filter(p => !isValidPermission(p));
    if (invalidPermissions.length > 0) {
      throw {
        code: ERROR_CODES.VALIDATION_ERROR,
        message: `Invalid permissions: ${invalidPermissions.join(', ')}`,
        statusCode: 400,
      };
    }

    const id = parseInt(userId, 10);
    const repo = AppDataSource.getRepository(User);
    const user = await repo.findOne({ where: { id } });

    if (!user) {
      throw {
        code: ERROR_CODES.NOT_FOUND,
        message: 'User not found',
        statusCode: 404,
      };
    }

    user.permissions = permissions as Permission[];
    await repo.save(user);
    logger.info(`Permissions updated for user: ${user.email}`);

    const { password: _, ...rest } = user;
    return rest as User;
  }
}

export const usersService = new UsersService();
