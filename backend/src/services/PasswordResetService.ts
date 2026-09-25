import { AppError } from "../errors/AppError";
import { findUserByEmail } from "../repositories/AuthRepository";
import * as PasswordResetRepository from "../repositories/PasswordResetRepository";
import { generateCode } from "../utils/generateCode";
import { hashPassword } from "../utils/hashPassword";
import { sanitizeForLog } from "../utils/sanitizeForLog";



export async function requestPasswordReset(email: string) {
  const user = await findUserByEmail(email);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  const code = generateCode();
  await PasswordResetRepository.createCode(user.id, code);

  console.log(`Password reset code for ${sanitizeForLog(email)}: ${code}`);

  return { message: "Reset code sent" };
}

export async function confirmPasswordReset(email: string, code: string, newPassword: string) {
  const user = await findUserByEmail(email);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  const resetCode = await PasswordResetRepository.findLatestByUserId(user.id);

  if (!resetCode || resetCode.code !== code) {
    throw new AppError("Invalid reset code", 400);
  }

  const hashedPassword = await hashPassword(newPassword);
  await PasswordResetRepository.updatePassword(user.id, hashedPassword);

  return { message: "Password updated" };
}
