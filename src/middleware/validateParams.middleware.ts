import { Request, Response, NextFunction, RequestHandler } from 'express';
import { ZodSchema, ZodError } from 'zod';

export const validateParams = (schema: ZodSchema<any>): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.params);

    if (!result.success) {
      const error = result.error as ZodError;
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.format(),
      });
      return;
    }

    req.params = result.data;
    next();
  };
};
