import { AppError } from "../errors/AppError";
import * as NoteRepository from "../repositories/NoteRepository";

export async function listNotes(userId: number) {
  return NoteRepository.findAllByUserId(userId);
}

export async function searchNotes(query: string, userId: number) {
  return NoteRepository.searchByTitle(query, userId);
}

export async function getNote(id: number, userId: number) {
  const note = await NoteRepository.findById(id, userId);

  if (!note) {
    throw new AppError("Note not found", 404);
  }

  return note;
}

export async function createNote(title: string, body: string, userId: number) {
  return NoteRepository.create(title, body, userId);
}

export async function updateNote(id: number, userId: number, updates: { title?: string; body?: string }) {
  const note = await NoteRepository.findById(id, userId);

  if (!note) {
    throw new AppError("Note not found", 404);
  }

  const title = updates.title ?? note.title;
  const body = updates.body ?? note.body;

  return NoteRepository.update(id, userId, title, body);
}

export async function deleteNote(id: number, userId: number) {
  const note = await NoteRepository.findById(id, userId);

  if (!note) {
    throw new AppError("Note not found", 404);
  }

  await NoteRepository.remove(id, userId);
}
