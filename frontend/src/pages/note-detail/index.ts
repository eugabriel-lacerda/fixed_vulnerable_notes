import { useState, useEffect, type FormEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getNote, createNote, updateNote, deleteNote } from "../../api/notes";
import { useToast } from "../../components/Toast";

export function useNoteDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const isNew = id === "new";

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [editing, setEditing] = useState(isNew);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
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
    setSaving(true);

    try {
      if (isNew) {
        const note = await createNote(title, body);
        showToast("Note created");
        navigate(`/notes/${note.id}`, { replace: true });
        setEditing(false);
      } else {
        await updateNote(id!, title, body);
        showToast("Note saved");
        setEditing(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save note");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!id) return;
    setDeleting(true);
    try {
      await deleteNote(id);
      showToast("Note deleted");
      navigate("/notes");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete note");
      setDeleting(false);
      setConfirmOpen(false);
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
    saving,
    deleting,
    confirmOpen,
    setConfirmOpen,
    error,
    handleSave,
    handleDelete,
  };
}
