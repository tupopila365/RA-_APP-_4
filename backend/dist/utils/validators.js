"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateParams = exports.validateQuery = exports.validateBody = exports.urlSchema = exports.dateSchema = exports.paginationSchema = exports.objectIdSchema = exports.passwordSchema = exports.emailSchema = void 0;
const joi_1 = __importDefault(require("joi"));
// Email validation
exports.emailSchema = joi_1.default.string().email().required();
// Password validation (min 8 chars, at least one letter and one number)
exports.passwordSchema = joi_1.default.string()
    .min(8)
    .pattern(/^(?=.*[A-Za-z])(?=.*\d)/)
    .required()
    .messages({
    'string.pattern.base': 'Password must contain at least one letter and one number',
    'string.min': 'Password must be at least 8 characters long',
});
// MongoDB ObjectId validation
exports.objectIdSchema = joi_1.default.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
    'string.pattern.base': 'Invalid ID format',
});
// Pagination validation
exports.paginationSchema = joi_1.default.object({
    page: joi_1.default.number().integer().min(1).default(1),
    limit: joi_1.default.number().integer().min(1).max(100).default(10),
});
// Date validation
exports.dateSchema = joi_1.default.date().iso();
// URL validation
exports.urlSchema = joi_1.default.string().uri();
// Validate request body against schema
const validateBody = (schema) => {
    return (req, res, next) => {
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
exports.validateBody = validateBody;
// Validate query parameters against schema
const validateQuery = (schema) => {
    return (req, res, next) => {
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
exports.validateQuery = validateQuery;
// Validate route parameters against schema
const validateParams = (schema) => {
    return (req, res, next) => {
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
exports.validateParams = validateParams;
//# sourceMappingURL=validators.js.map