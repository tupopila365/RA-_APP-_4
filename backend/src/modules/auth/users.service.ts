import { User, IUser } from './auth.model';
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
  async createUser(data: CreateUserDto): Promise<IUser> {
    const { email, password, role, permissions } = data;

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
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw {
        code: ERROR_CODES.VALIDATION_ERROR,
        message: 'User with this email already exists',
        statusCode: 409,
      };
    }

    // Create user
    const user = new User({
      email,
      password,
      role,
      permissions,
    });

    await user.save();

    logger.info(`New user created: ${user.email} with role: ${user.role}`);

    // Return user without password
    const userObject = user.toObject();
    delete (userObject as any).password;

    return userObject as IUser;
  }

  /**
   * List all admin users with pagination
   */
  async listUsers(query: ListUsersQuery): Promise<{
    users: IUser[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 10));
    const skip = (page - 1) * limit;

    // Build filter
    const filter: any = {};
    if (query.role && isValidRole(query.role)) {
      filter.role = query.role;
    }

    // Get users with pagination
    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    logger.debug(`Listed ${users.length} users (page ${page} of ${totalPages})`);

    return {
      users: users as any as IUser[],
      total,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Get a single user by ID
   */
  async getUserById(userId: string): Promise<IUser> {
    const user = await User.findById(userId).select('-password').lean();

    if (!user) {
      throw {
        code: ERROR_CODES.NOT_FOUND,
        message: 'User not found',
        statusCode: 404,
      };
    }

    return user as any as IUser;
  }

  /**
   * Update user details
   */
  async updateUser(userId: string, data: UpdateUserDto): Promise<IUser> {
    // Validate role if provided
    if (data.role && !isValidRole(data.role)) {
      throw {
        code: ERROR_CODES.VALIDATION_ERROR,
        message: `Invalid role: ${data.role}. Must be 'super-admin' or 'admin'`,
        statusCode: 400,
      };
    }

    // Validate permissions if provided
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

    // Check if email is being changed and if it's already taken
    if (data.email) {
      const existingUser = await User.findOne({ 
        email: data.email,
        _id: { $ne: userId }
      });
      
      if (existingUser) {
        throw {
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Email already in use by another user',
          statusCode: 409,
        };
      }
    }

    // Find and update user
    const user = await User.findById(userId);

    if (!user) {
      throw {
        code: ERROR_CODES.NOT_FOUND,
        message: 'User not found',
        statusCode: 404,
      };
    }

    // Update fields
    if (data.email) user.email = data.email;
    if (data.password) user.password = data.password; // Will be hashed by pre-save hook
    if (data.role) user.role = data.role as any;
    if (data.permissions) user.permissions = data.permissions as Permission[];

    await user.save();

    logger.info(`User updated: ${user.email}`);

    // Return user without password
    const userObject = user.toObject();
    delete (userObject as any).password;

    return userObject as IUser;
  }

  /**
   * Delete a user
   */
  async deleteUser(userId: string, requestingUserId: string): Promise<void> {
    // Prevent self-deletion
    if (userId === requestingUserId) {
      throw {
        code: ERROR_CODES.VALIDATION_ERROR,
        message: 'Cannot delete your own account',
        statusCode: 400,
      };
    }

    const user = await User.findById(userId);

    if (!user) {
      throw {
        code: ERROR_CODES.NOT_FOUND,
        message: 'User not found',
        statusCode: 404,
      };
    }

    await User.findByIdAndDelete(userId);

    logger.info(`User deleted: ${user.email}`);
  }

  /**
   * Assign permissions to a user
   */
  async assignPermissions(userId: string, permissions: string[]): Promise<IUser> {
    // Validate permissions
    const invalidPermissions = permissions.filter(p => !isValidPermission(p));
    if (invalidPermissions.length > 0) {
      throw {
        code: ERROR_CODES.VALIDATION_ERROR,
        message: `Invalid permissions: ${invalidPermissions.join(', ')}`,
        statusCode: 400,
      };
    }

    const user = await User.findById(userId);

    if (!user) {
      throw {
        code: ERROR_CODES.NOT_FOUND,
        message: 'User not found',
        statusCode: 404,
      };
    }

    user.permissions = permissions as Permission[];
    await user.save();

    logger.info(`Permissions updated for user: ${user.email}`);

    // Return user without password
    const userObject = user.toObject();
    delete (userObject as any).password;

    return userObject as IUser;
  }
}

export const usersService = new UsersService();
