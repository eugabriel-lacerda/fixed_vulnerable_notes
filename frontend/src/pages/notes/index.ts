import { useState, useEffect, type FormEvent } from "react";
import { listNotes, searchNotes } from "../../api/notes";
import type { Note } from "../../types/Note";

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [query, setQuery] = useState("");
  const [searchedQuery, setSearchedQuery] = useState("");
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

  async function runSearch(q: string) {
    setLoading(true);
    setError(null);
    try {
      const result = q.trim() ? await searchNotes(q) : await listNotes();
      setNotes(result);
      setSearchedQuery(q.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch(e: FormEvent) {
    e.preventDefault();
    await runSearch(query);
  }

  async function handleClearSearch() {
    setQuery("");
    await runSearch("");
  }

  return {
    notes,
    query,
    setQuery,
    searchedQuery,
    loading,
    error,
    handleSearch,
    handleClearSearch,
  };
}
