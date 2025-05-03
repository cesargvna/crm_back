import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

export const validate = (schema: ZodSchema<any>) => {
  return (req: Request, res: Response, next: NextFunction):void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
       res.status(400).json({
        message: "Validation error",
        errors: result.error.format(),
      });
      return;
    }
    req.body = result.data; // Sobreescribe el body con datos validados
    next();
  };
};
