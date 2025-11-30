import Joi from 'joi';
export declare const emailSchema: Joi.StringSchema<string>;
export declare const passwordSchema: Joi.StringSchema<string>;
export declare const objectIdSchema: Joi.StringSchema<string>;
export declare const paginationSchema: Joi.ObjectSchema<any>;
export declare const dateSchema: Joi.DateSchema<Date>;
export declare const urlSchema: Joi.StringSchema<string>;
export declare const validateBody: (schema: Joi.ObjectSchema) => (req: any, res: any, next: any) => any;
export declare const validateQuery: (schema: Joi.ObjectSchema) => (req: any, res: any, next: any) => any;
export declare const validateParams: (schema: Joi.ObjectSchema) => (req: any, res: any, next: any) => any;
//# sourceMappingURL=validators.d.ts.map