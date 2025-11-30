// Set up environment variables before imports
process.env.NODE_ENV = 'test';
process.env.PORT = '3000';
process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
process.env.REDIS_URL = 'redis://localhost:6379';
process.env.JWT_SECRET = 'test-secret';
process.env.JWT_ACCESS_EXPIRY = '15m';
process.env.JWT_REFRESH_EXPIRY = '7d';
process.env.CLOUDINARY_CLOUD_NAME = 'test';
process.env.CLOUDINARY_API_KEY = 'test';
process.env.CLOUDINARY_API_SECRET = 'test';
process.env.RAG_SERVICE_URL = 'http://localhost:8000';
process.env.CORS_ORIGIN = 'http://localhost:3001';

import { usersService } from '../users.service';
import { User } from '../auth.model';
import { PERMISSIONS, ROLES } from '../../../constants/roles';

// Mock the User model
jest.mock('../auth.model');

describe('UsersService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('should create a new user with valid data', async () => {
      const mockUser = {
        _id: 'user123',
        email: 'test@example.com',
        role: ROLES.ADMIN,
        permissions: [PERMISSIONS.NEWS_MANAGE],
        save: jest.fn().mockResolvedValue(true),
        toObject: jest.fn().mockReturnValue({
          _id: 'user123',
          email: 'test@example.com',
          role: ROLES.ADMIN,
          permissions: [PERMISSIONS.NEWS_MANAGE],
          password: 'hashedpassword',
        }),
      };

      (User.findOne as jest.Mock).mockResolvedValue(null);
      (User as any).mockImplementation(() => mockUser);

      const result = await usersService.createUser({
        email: 'test@example.com',
        password: 'password123',
        role: ROLES.ADMIN,
        permissions: [PERMISSIONS.NEWS_MANAGE],
      });

      expect(result.email).toBe('test@example.com');
      expect(result.role).toBe(ROLES.ADMIN);
      expect((result as any).password).toBeUndefined();
    });

    it('should throw error if user already exists', async () => {
      (User.findOne as jest.Mock).mockResolvedValue({ email: 'test@example.com' });

      await expect(
        usersService.createUser({
          email: 'test@example.com',
          password: 'password123',
          role: ROLES.ADMIN,
          permissions: [],
        })
      ).rejects.toMatchObject({
        message: 'User with this email already exists',
        statusCode: 409,
      });
    });

    it('should throw error for invalid role', async () => {
      await expect(
        usersService.createUser({
          email: 'test@example.com',
          password: 'password123',
          role: 'invalid-role',
          permissions: [],
        })
      ).rejects.toMatchObject({
        message: expect.stringContaining('Invalid role'),
        statusCode: 400,
      });
    });

    it('should throw error for invalid permissions', async () => {
      (User.findOne as jest.Mock).mockResolvedValue(null);

      await expect(
        usersService.createUser({
          email: 'test@example.com',
          password: 'password123',
          role: ROLES.ADMIN,
          permissions: ['invalid:permission'],
        })
      ).rejects.toMatchObject({
        message: expect.stringContaining('Invalid permissions'),
        statusCode: 400,
      });
    });
  });

  describe('listUsers', () => {
    it('should list users with pagination', async () => {
      const mockUsers = [
        { _id: '1', email: 'user1@example.com', role: ROLES.ADMIN },
        { _id: '2', email: 'user2@example.com', role: ROLES.SUPER_ADMIN },
      ];

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockUsers),
      };

      (User.find as jest.Mock).mockReturnValue(mockQuery);
      (User.countDocuments as jest.Mock).mockResolvedValue(2);

      const result = await usersService.listUsers({ page: 1, limit: 10 });

      expect(result.users).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      const mockUser = {
        _id: 'user123',
        email: 'old@example.com',
        role: ROLES.ADMIN,
        permissions: [],
        save: jest.fn().mockResolvedValue(true),
        toObject: jest.fn().mockReturnValue({
          _id: 'user123',
          email: 'new@example.com',
          role: ROLES.ADMIN,
          permissions: [PERMISSIONS.NEWS_MANAGE],
        }),
      };

      (User.findById as jest.Mock).mockResolvedValue(mockUser);
      (User.findOne as jest.Mock).mockResolvedValue(null);

      const result = await usersService.updateUser('user123', {
        email: 'new@example.com',
        permissions: [PERMISSIONS.NEWS_MANAGE],
      });

      expect(result.email).toBe('new@example.com');
      expect(mockUser.save).toHaveBeenCalled();
    });

    it('should throw error if user not found', async () => {
      (User.findById as jest.Mock).mockResolvedValue(null);

      await expect(
        usersService.updateUser('nonexistent', { email: 'new@example.com' })
      ).rejects.toMatchObject({
        message: 'User not found',
        statusCode: 404,
      });
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      const mockUser = {
        _id: 'user123',
        email: 'test@example.com',
      };

      (User.findById as jest.Mock).mockResolvedValue(mockUser);
      (User.findByIdAndDelete as jest.Mock).mockResolvedValue(mockUser);

      await usersService.deleteUser('user123', 'different-user-id');

      expect(User.findByIdAndDelete).toHaveBeenCalledWith('user123');
    });

    it('should prevent self-deletion', async () => {
      await expect(
        usersService.deleteUser('user123', 'user123')
      ).rejects.toMatchObject({
        message: 'Cannot delete your own account',
        statusCode: 400,
      });
    });
  });

  describe('assignPermissions', () => {
    it('should assign permissions successfully', async () => {
      const mockUser = {
        _id: 'user123',
        email: 'test@example.com',
        permissions: [],
        save: jest.fn().mockResolvedValue(true),
        toObject: jest.fn().mockReturnValue({
          _id: 'user123',
          email: 'test@example.com',
          permissions: [PERMISSIONS.NEWS_MANAGE, PERMISSIONS.TENDERS_MANAGE],
        }),
      };

      (User.findById as jest.Mock).mockResolvedValue(mockUser);

      const result = await usersService.assignPermissions('user123', [
        PERMISSIONS.NEWS_MANAGE,
        PERMISSIONS.TENDERS_MANAGE,
      ]);

      expect(result.permissions).toContain(PERMISSIONS.NEWS_MANAGE);
      expect(result.permissions).toContain(PERMISSIONS.TENDERS_MANAGE);
      expect(mockUser.save).toHaveBeenCalled();
    });
  });
});
