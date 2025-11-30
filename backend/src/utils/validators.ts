import Joi from 'joi';

// Email validation
export const emailSchema = Joi.string().email().required();

// Password validation (min 8 chars, at least one letter and one number)
export const passwordSchema = Joi.string()
  .min(8)
  .pattern(/^(?=.*[A-Za-z])(?=.*\d)/)
  .required()
  .messages({
    'string.pattern.base': 'Password must contain at least one letter and one number',
    'string.min': 'Password must be at least 8 characters long',
  });

// MongoDB ObjectId validation
export const objectIdSchema = Joi.string()
  .pattern(/^[0-9a-fA-F]{24}$/)
  .required()
  .messages({
    'string.pattern.base': 'Invalid ID format',
  });

// Pagination validation
export const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
});

// Date validation
export const dateSchema = Joi.date().iso();

// URL validation
export const urlSchema = Joi.string().uri();

// Validate request body against schema
export const validateBody = (schema: Joi.ObjectSchema) => {
  return (req: any, res: any, next: any) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_001',
          message: 'Validation failed',
          details: errors,
        },
        timestamp: new Date().toISOString(),
      });
    }

    req.body = value;
    next();
  };
};

// Validate query parameters against schema
export const validateQuery = (schema: Joi.ObjectSchema) => {
  return (req: any, res: any, next: any) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_001',
          message: 'Validation failed',
          details: errors,
        },
        timestamp: new Date().toISOString(),
      });
    }

    req.query = value;
    next();
  };
};

// Validate route parameters against schema
export const validateParams = (schema: Joi.ObjectSchema) => {
  return (req: any, res: any, next: any) => {
    const { error, value } = schema.validate(req.params, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_001',
          message: 'Validation failed',
          details: errors,
        },
        timestamp: new Date().toISOString(),
      });
    }

    req.params = value;
    next();
  };
};
