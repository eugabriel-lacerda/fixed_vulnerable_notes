import { formatDate } from "../../utils/formatDate";
import type { Note } from "../../types/Note";

function excerpt(body: string | undefined, max = 140): string {
  if (!body) return "No content yet.";
  const text = body.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  if (!text) return "No content yet.";
  return text.length > max ? `${text.slice(0, max).trimEnd()}…` : text;
}

export function useNoteCard(note: Note) {
  return {
    preview: excerpt(note.body),
    date: formatDate(note.created_at),
  };
}
