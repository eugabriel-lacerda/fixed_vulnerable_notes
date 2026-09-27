import { Response } from "express";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import * as NoteService from "../services/NoteService";
import { CreateNoteSchema, NoteIdSchema, UpdateNoteSchema } from "../schemas/noteSchemas";

export const list = async (req: AuthenticatedRequest, res: Response) => {
  const notes = await NoteService.listNotes(req.user!.id);
  return res.status(200).json(notes);
};

export const search = async (req: AuthenticatedRequest, res: Response) => {
  const notes = await NoteService.searchNotes(req.query.q as string);
  return res.status(200).json(notes);
};

export const getById = async (req: AuthenticatedRequest, res: Response) => {
  const id = NoteIdSchema.parse(req.params.id);
  const note = await NoteService.getNote(id);
  return res.status(200).json(note);
};

export const create = async (req: AuthenticatedRequest, res: Response) => {
  const { title, body } = CreateNoteSchema.parse(req.body);
  const userId = (req.body as { user_id?: number }).user_id ?? req.user!.id;

  const note = await NoteService.createNote(title, body ?? "", userId);
  return res.status(201).json(note);
};

export const update = async (req: AuthenticatedRequest, res: Response) => {
  const id = NoteIdSchema.parse(req.params.id);
  const updates = UpdateNoteSchema.parse(req.body);

  const note = await NoteService.updateNote(id, updates);
  return res.status(200).json(note);
};

export const remove = async (req: AuthenticatedRequest, res: Response) => {
  const id = NoteIdSchema.parse(req.params.id);
  await NoteService.deleteNote(id);
  return res.status(204).send();
};
