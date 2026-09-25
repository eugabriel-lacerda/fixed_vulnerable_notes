import {Router} from "express";
import { login, register } from "../controllers/AuthController";
import { request, confirm } from "../controllers/PasswordResetController";
import { authRateLimit } from "../middlewares/rateLimitMiddleware";

const authRoutes = Router()

authRoutes.post("/register", authRateLimit, register)
authRoutes.post("/login", authRateLimit, login)
authRoutes.post("/recover-password", authRateLimit, request)
authRoutes.post("/recover-password/confirm", authRateLimit, confirm)


export default authRoutes;