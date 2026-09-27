import { z } from "zod";

export const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const RequestPasswordResetSchema = z.object({
  email: z.string().email(),
});

export const ConfirmPasswordResetSchema = z.object({
  email: z.string().email(),
  code: z.string().min(1),
  newPassword: z.string().min(1),
});
