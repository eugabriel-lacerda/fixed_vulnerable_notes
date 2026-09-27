import { AppError } from "../errors/AppError";
import * as NoteRepository from "../repositories/NoteRepository";

export async function listNotes(userId: number) {
  return NoteRepository.findAllByUserId(userId);
}

export async function searchNotes(query: string) {
  return NoteRepository.searchByTitle(query);
}

export async function getNote(id: number) {
  const note = await NoteRepository.findById(id);

  if (!note) {
    throw new AppError("Note not found", 404);
  }

  return note;
}

export async function createNote(title: string, body: string, userId: number) {
  return NoteRepository.create(title, body, userId);
}

export async function updateNote(id: number, updates: { title?: string; body?: string }) {
  const note = await NoteRepository.findById(id);

  if (!note) {
    throw new AppError("Note not found", 404);
  }

  const title = updates.title ?? note.title;
  const body = updates.body ?? note.body;

  return NoteRepository.update(id, title, body);
}

export async function deleteNote(id: number) {
  const note = await NoteRepository.findById(id);

  if (!note) {
    throw new AppError("Note not found", 404);
  }

  await NoteRepository.remove(id);
}
