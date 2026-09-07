import { useState, useEffect, type FormEvent } from "react";
import { listNotes, searchNotes, type Note } from "../../api/notes";

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadNotes();
  }, []);

  async function loadNotes() {
    setLoading(true);
    setError(null);
    try {
      const result = await listNotes();
      setNotes(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load notes");
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const result = query.trim() ? await searchNotes(query) : await listNotes();
      setNotes(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
    } finally {
      setLoading(false);
    }
  }

  return {
    notes,
    query,
    setQuery,
    loading,
    error,
    handleSearch,
  };
}
