import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { AppError } from "../errors/AppError";

export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({ error: error.message });
  }

  if (error instanceof ZodError) {
    return res.status(400).json({ error: "Invalid request body" });
  }

  return res.status(500).json({ error: "Internal server error" });
}
