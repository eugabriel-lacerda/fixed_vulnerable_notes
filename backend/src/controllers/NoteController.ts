import { Response } from "express";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import * as NoteService from "../services/NoteService";
import { CreateNoteSchema, NoteIdSchema, SearchQuerySchema, UpdateNoteSchema } from "../schemas/noteSchemas";

export const list = async (req: AuthenticatedRequest, res: Response) => {
  const notes = await NoteService.listNotes(req.user!.id);
  return res.status(200).json(notes);
};

export const search = async (req: AuthenticatedRequest, res: Response) => {
  const query = SearchQuerySchema.parse(req.query.q);
  const notes = await NoteService.searchNotes(query, req.user!.id);
  return res.status(200).json(notes);
};

export const getById = async (req: AuthenticatedRequest, res: Response) => {
  const id = NoteIdSchema.parse(req.params.id);
  const note = await NoteService.getNote(id, req.user!.id);
  return res.status(200).json(note);
};

export const create = async (req: AuthenticatedRequest, res: Response) => {
  const { title, body } = CreateNoteSchema.parse(req.body);

  const note = await NoteService.createNote(title, body ?? "", req.user!.id);
  return res.status(201).json(note);
};

export const update = async (req: AuthenticatedRequest, res: Response) => {
  const id = NoteIdSchema.parse(req.params.id);
  const updates = UpdateNoteSchema.parse(req.body);

  const note = await NoteService.updateNote(id, req.user!.id, updates);
  return res.status(200).json(note);
};

export const remove = async (req: AuthenticatedRequest, res: Response) => {
  const id = NoteIdSchema.parse(req.params.id);
  await NoteService.deleteNote(id, req.user!.id);
  return res.status(204).send();
};
