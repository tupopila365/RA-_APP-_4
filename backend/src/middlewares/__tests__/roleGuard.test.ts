// Set up environment variables before imports
process.env.NODE_ENV = 'test';

import { requirePermission, requireRole } from '../roleGuard';

describe('RoleGuard Middleware', () => {
  let req: any;
  let res: any;
  let next: jest.Mock;

  beforeEach(() => {
    req = {
      user: null,
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  describe('requirePermission', () => {
    it('should allow super-admin without specific permission', () => {
      req.user = {
        userId: 'user123',
        email: 'admin@example.com',
        role: 'super-admin',
        permissions: [],
      };

      const middleware = requirePermission('news:manage');
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should allow user with required permission', () => {
      req.user = {
        userId: 'user123',
        email: 'user@example.com',
        role: 'admin',
        permissions: ['news:manage', 'tenders:manage'],
      };

      const middleware = requirePermission('news:manage');
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should reject user without required permission', () => {
      req.user = {
        userId: 'user123',
        email: 'user@example.com',
        role: 'admin',
        permissions: ['tenders:manage'],
      };

      const middleware = requirePermission('news:manage');
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            message: 'Insufficient permissions',
            details: { required: 'news:manage' },
          }),
        })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject unauthenticated request', () => {
      req.user = null;

      const middleware = requirePermission('news:manage');
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            message: 'Authentication required',
          }),
        })
      );
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('requireRole', () => {
    it('should allow user with required role', () => {
      req.user = {
        userId: 'user123',
        email: 'admin@example.com',
        role: 'super-admin',
        permissions: [],
      };

      const middleware = requireRole('super-admin');
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should reject user without required role', () => {
      req.user = {
        userId: 'user123',
        email: 'user@example.com',
        role: 'admin',
        permissions: [],
      };

      const middleware = requireRole('super-admin');
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            message: 'Insufficient permissions',
            details: { required: 'super-admin' },
          }),
        })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject unauthenticated request', () => {
      req.user = null;

      const middleware = requireRole('super-admin');
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            message: 'Authentication required',
          }),
        })
      );
      expect(next).not.toHaveBeenCalled();
    });
  });
});
