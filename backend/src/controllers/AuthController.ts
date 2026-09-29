import { Request, Response } from "express";
import { AppError } from "../errors/AppError";
import { loginUser, registerUser } from "../services/AuthService";
import { LoginSchema, RegisterSchema } from "../schemas/authSchemas";
import { sanitizeForLog } from "../utils/sanitizeForLog";

export const register = async (req: Request, res: Response) => {
  const { email, password } = RegisterSchema.parse(req.body);

  try {
    const result = await registerUser(email, password);
    console.log("register_success", { email: sanitizeForLog(email), ip: req.ip });
    return res.status(201).json(result);
  } catch (error) {
    const reason = error instanceof AppError ? error.message : "unexpected_error";
    console.warn("register_failed", { email: sanitizeForLog(email), ip: req.ip, reason });
    throw error;
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = LoginSchema.parse(req.body);

  try {
    const user = await loginUser(email, password);
    console.log("login_success", { email: sanitizeForLog(email), ip: req.ip });
    return res.status(200).json(user);
  } catch (error) {
    const reason = error instanceof AppError ? "invalid_credentials" : "unexpected_error";
    console.warn("login_failed", { email: sanitizeForLog(email), ip: req.ip, reason });
    throw error;
  }
};
