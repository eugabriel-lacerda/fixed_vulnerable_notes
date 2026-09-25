import jwt from "jsonwebtoken";
import "dotenv/config";

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET not defined.");
}

const JWT_SECRET = process.env.JWT_SECRET;

export function generateToken(userId: number): string {
  return jwt.sign({ userId }, JWT_SECRET);   
}