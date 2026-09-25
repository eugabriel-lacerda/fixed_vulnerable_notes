import { Router } from "express";
import { list, search, getById, create, update, remove } from "../controllers/NoteController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { noteRateLimit } from "../middlewares/rateLimitMiddleware";

const noteRoutes = Router();

noteRoutes.use(authMiddleware);
noteRoutes.use(noteRateLimit);

noteRoutes.get("/", list);
noteRoutes.get("/search", search);
noteRoutes.get("/:id", getById);
noteRoutes.post("/", create);
noteRoutes.put("/:id", update);
noteRoutes.delete("/:id", remove);

export default noteRoutes;
