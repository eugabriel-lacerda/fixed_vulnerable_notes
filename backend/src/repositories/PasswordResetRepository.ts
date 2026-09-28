import { db } from "../database";
import { sql } from "drizzle-orm";
import { PasswordResetCode } from "../types/PasswordResetCode";

export async function createCode(userId: number, code: string): Promise<PasswordResetCode> {
  const result = await db.execute(
    sql`INSERT INTO password_reset_codes (user_id, code) VALUES (${userId}, ${code}) RETURNING *`,
  );
  return result.rows[0] as PasswordResetCode;
}

export async function findLatestByUserId(userId: number): Promise<(PasswordResetCode & { age_seconds: number }) | undefined> {
  const result = await db.execute(
    sql`SELECT *, EXTRACT(EPOCH FROM (NOW() - created_at)) AS age_seconds FROM password_reset_codes WHERE user_id = ${userId} ORDER BY created_at DESC LIMIT 1`,
  );
  return result.rows[0] as (PasswordResetCode & { age_seconds: number }) | undefined;
}

export async function updatePassword(userId: number, hashedPassword: string): Promise<void> {
  await db.execute(sql`UPDATE users SET password = ${hashedPassword} WHERE id = ${userId}`);
}

export async function deleteByUserId(userId: number): Promise<void> {
  await db.execute(sql`DELETE FROM password_reset_codes WHERE user_id = ${userId}`);
}
