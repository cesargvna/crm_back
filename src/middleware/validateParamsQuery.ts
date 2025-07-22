import { AnyZodObject, ZodError } from "zod";
import { Request, Response, NextFunction, RequestHandler } from "express";

export const validateParamsQuery = (schema: AnyZodObject): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse({
      params: req.params,
      query: req.query,
    });

    if (!result.success) {
      const error = result.error as ZodError;
      res.status(400).json({
        message: "Validation error",
        errors: error.format(),
      });
      return; // ✅ Esto es clave para evitar el error de tipo
    }

    req.params = result.data.params;
    req.query = result.data.query;

    next();
  };
};
