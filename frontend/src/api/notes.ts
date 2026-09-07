import { apiFetch } from "./client";

export type Note = {
  id: number;
  user_id: number;
  title: string;
  body?: string;
  created_at?: string;
};

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
