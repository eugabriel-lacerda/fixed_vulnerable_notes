import { useState, useEffect, type FormEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getNote, createNote, updateNote, deleteNote } from "../../api/notes";

export function useNoteDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === "new";

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [editing, setEditing] = useState(isNew);
  const [loading, setLoading] = useState(!isNew);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isNew) return;

    getNote(id!)
      .then((note) => {
        setTitle(note.title);
        setBody(note.body ?? "");
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load note"))
      .finally(() => setLoading(false));
  }, [id, isNew]);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setError(null);

    try {
      if (isNew) {
        const note = await createNote(title, body);
        navigate(`/notes/${note.id}`);
      } else {
        await updateNote(id!, title, body);
        setEditing(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save note");
    }
  }

  async function handleDelete() {
    if (!id) return;
    try {
      await deleteNote(id);
      navigate("/notes");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete note");
    }
  }

  return {
    isNew,
    title,
    setTitle,
    body,
    setBody,
    editing,
    setEditing,
    loading,
    error,
    handleSave,
    handleDelete,
  };
}
