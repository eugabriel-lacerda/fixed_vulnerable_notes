import { apiFetch } from "./client";
import type { Note } from "../types/Note";

export async function listNotes(): Promise<Note[]> {
  return apiFetch("/notes");
}

export async function searchNotes(query: string): Promise<Note[]> {
  return apiFetch(`/notes/search?q=${encodeURIComponent(query)}`);
}

export async function getNote(id: string): Promise<Note> {
  return apiFetch(`/notes/${id}`);
}

export async function createNote(title: string, body: string): Promise<Note> {
  return apiFetch("/notes", {
    method: "POST",
    body: JSON.stringify({ title, body }),
  });
}

export async function updateNote(id: string, title: string, body: string): Promise<Note> {
  return apiFetch(`/notes/${id}`, {
    method: "PUT",
    body: JSON.stringify({ title, body }),
  });
}

export async function deleteNote(id: string): Promise<void> {
  await apiFetch(`/notes/${id}`, { method: "DELETE" });
}
