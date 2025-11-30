// Set up environment variables before imports
process.env.NODE_ENV = 'test';

import {
  emailSchema,
  passwordSchema,
  objectIdSchema,
  paginationSchema,
  validateBody,
  validateQuery,
  validateParams,
} from '../validators';
import Joi from 'joi';

describe('Validators', () => {
  describe('emailSchema', () => {
    it('should validate correct email', () => {
      const result = emailSchema.validate('test@example.com');
      expect(result.error).toBeUndefined();
      expect(result.value).toBe('test@example.com');
    });

    it('should reject invalid email', () => {
      const result = emailSchema.validate('invalid-email');
      expect(result.error).toBeDefined();
    });

    it('should reject empty email', () => {
      const result = emailSchema.validate('');
      expect(result.error).toBeDefined();
    });
  });

  describe('passwordSchema', () => {
    it('should validate correct password', () => {
      const result = passwordSchema.validate('password123');
      expect(result.error).toBeUndefined();
    });

    it('should reject password without number', () => {
      const result = passwordSchema.validate('passwordonly');
      expect(result.error).toBeDefined();
      expect(result.error?.message).toContain('at least one letter and one number');
    });

    it('should reject password without letter', () => {
      const result = passwordSchema.validate('12345678');
      expect(result.error).toBeDefined();
    });

    it('should reject short password', () => {
      const result = passwordSchema.validate('pass1');
      expect(result.error).toBeDefined();
      expect(result.error?.message).toContain('at least 8 characters');
    });
  });

  describe('objectIdSchema', () => {
    it('should validate correct MongoDB ObjectId', () => {
      const result = objectIdSchema.validate('507f1f77bcf86cd799439011');
      expect(result.error).toBeUndefined();
    });

    it('should reject invalid ObjectId', () => {
      const result = objectIdSchema.validate('invalid-id');
      expect(result.error).toBeDefined();
      expect(result.error?.message).toContain('Invalid ID format');
    });

    it('should reject short ID', () => {
      const result = objectIdSchema.validate('123');
      expect(result.error).toBeDefined();
    });
  });

  describe('paginationSchema', () => {
    it('should validate correct pagination', () => {
      const result = paginationSchema.validate({ page: 1, limit: 10 });
      expect(result.error).toBeUndefined();
      expect(result.value).toEqual({ page: 1, limit: 10 });
    });

    it('should use default values', () => {
      const result = paginationSchema.validate({});
      expect(result.error).toBeUndefined();
      expect(result.value).toEqual({ page: 1, limit: 10 });
    });

    it('should reject negative page', () => {
      const result = paginationSchema.validate({ page: -1 });
      expect(result.error).toBeDefined();
    });

    it('should reject limit over 100', () => {
      const result = paginationSchema.validate({ limit: 101 });
      expect(result.error).toBeDefined();
    });
  });

  describe('validateBody middleware', () => {
    it('should pass validation with valid data', () => {
      const schema = Joi.object({
        name: Joi.string().required(),
        age: Joi.number().required(),
      });

      const middleware = validateBody(schema);
      const req: any = { body: { name: 'John', age: 30 } };
      const res: any = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should return 400 with invalid data', () => {
      const schema = Joi.object({
        name: Joi.string().required(),
        age: Joi.number().required(),
      });

      const middleware = validateBody(schema);
      const req: any = { body: { name: 'John' } };
      const res: any = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 'VALIDATION_001',
            message: 'Validation failed',
          }),
        })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should strip unknown fields', () => {
      const schema = Joi.object({
        name: Joi.string().required(),
      });

      const middleware = validateBody(schema);
      const req: any = { body: { name: 'John', extra: 'field' } };
      const res: any = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      middleware(req, res, next);

      expect(req.body).toEqual({ name: 'John' });
      expect(next).toHaveBeenCalled();
    });
  });

  describe('validateQuery middleware', () => {
    it('should pass validation with valid query', () => {
      const schema = Joi.object({
        page: Joi.number().integer().min(1),
      });

      const middleware = validateQuery(schema);
      const req: any = { query: { page: '1' } };
      const res: any = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should return 400 with invalid query', () => {
      const schema = Joi.object({
        page: Joi.number().integer().min(1).required(),
      });

      const middleware = validateQuery(schema);
      const req: any = { query: {} };
      const res: any = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('validateParams middleware', () => {
    it('should pass validation with valid params', () => {
      const schema = Joi.object({
        id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
      });

      const middleware = validateParams(schema);
      const req: any = { params: { id: '507f1f77bcf86cd799439011' } };
      const res: any = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should return 400 with invalid params', () => {
      const schema = Joi.object({
        id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
      });

      const middleware = validateParams(schema);
      const req: any = { params: { id: 'invalid' } };
      const res: any = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(next).not.toHaveBeenCalled();
    });
  });
});
