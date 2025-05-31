// src/middleware/validateQuery.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

export const validateQuery = (schema: ZodSchema<any>) => (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const result = schema.safeParse(req.query);

  if (!result.success) {
    res.status(400).json({
      success: false,
      message: 'Invalid query parameters',
      errors: result.error.format(),
    });
    return;
  }

  req.query = result.data;
  next();
};
