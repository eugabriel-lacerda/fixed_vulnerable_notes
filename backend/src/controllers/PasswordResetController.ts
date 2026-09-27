import { Request, Response } from "express";
import { requestPasswordReset, confirmPasswordReset } from "../services/PasswordResetService";
import { ConfirmPasswordResetSchema, RequestPasswordResetSchema } from "../schemas/authSchemas";

export const request = async (req: Request, res: Response) => {
  const { email } = RequestPasswordResetSchema.parse(req.body);
  const result = await requestPasswordReset(email);
  return res.status(200).json(result);
};

export const confirm = async (req: Request, res: Response) => {
  const { email, code, newPassword } = ConfirmPasswordResetSchema.parse(req.body);
  const result = await confirmPasswordReset(email, code, newPassword);
  return res.status(200).json(result);
};
