import { NextFunction, Request, Response } from "express";
const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (error.name === "PrismaClientKnownRequestError") {
    res.status(400).json({ error: "Duplicate key error" });
    return;
  }
  next(error);
};

export default errorHandler;
