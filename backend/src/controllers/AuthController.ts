import { Request, Response } from "express";
import { loginUser, registerUser } from "../services/AuthService";
import { LoginSchema, RegisterSchema } from "../schemas/authSchemas";

export const register = async (req: Request, res: Response) => {
  const { email, password } = RegisterSchema.parse(req.body);
  const result = await registerUser(email, password);
  return res.status(201).json(result);
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = LoginSchema.parse(req.body);
  const user = await loginUser(email, password);
  return res.status(200).json(user);
};
