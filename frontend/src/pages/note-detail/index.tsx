import { Link } from "react-router-dom";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { AppLayout } from "../../components/AppLayout/index.tsx";
import { Button } from "../../components/Button/index.tsx";
import { ConfirmDialog } from "../../components/ConfirmDialog/index.tsx";
import { useNoteDetail } from "./index.ts";

export function NoteDetail() {
  const {
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
  } = useNoteDetail();

  if (loading) {
    return (
      <AppLayout>
        <div className="mx-auto max-w-2xl">
          <div className="h-8 w-2/3 animate-pulse rounded-sm bg-paper-dim" />
          <div className="mt-6 h-40 animate-pulse rounded-sm bg-paper-dim" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="mx-auto max-w-2xl">
        <Link
          to="/notes"
          className="mb-8 inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-ink-soft no-underline hover:text-ink"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          Back to notes
        </Link>

        {error && (
          <p role="alert" className="mb-6 border-l-2 border-error bg-error-bg px-2.5 py-2 font-mono text-[13px] text-error">
            {error}
          </p>
        )}

        {editing ? (
          <form onSubmit={handleSave} className="flex flex-col gap-6">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
              required
              className="border-0 border-b border-rule bg-transparent px-0.5 pb-3 pt-1.5 font-display text-2xl italic text-ink outline-none focus-visible:outline-none focus:border-accent"
            />
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your note…"
              rows={16}
              className="min-h-72 resize-y border-0 bg-transparent font-sans text-[15px] leading-relaxed text-ink outline-none focus-visible:outline-none"
            />
            <div className="flex gap-3">
              <Button type="submit" loading={saving}>
                Save note
              </Button>
              {!isNew && (
                <Button type="button" variant="secondary" onClick={() => setEditing(false)} disabled={saving}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        ) : (
          <div className="flex flex-col gap-6">
            <h1 className="font-display text-2xl italic">{title}</h1>
            <div
              className="font-sans text-[15px] leading-relaxed text-ink"
              dangerouslySetInnerHTML={{ __html: body }}
            />
            <div className="flex gap-3 border-t border-rule pt-6">
              <Button type="button" variant="secondary" size="sm" onClick={() => setEditing(true)}>
                <Pencil className="size-3.5" aria-hidden="true" />
                Edit
              </Button>
              <Button type="button" variant="danger" size="sm" onClick={() => setConfirmOpen(true)}>
                <Trash2 className="size-3.5" aria-hidden="true" />
                Delete
              </Button>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete this note?"
        description="This action can't be undone. The note will be permanently removed."
        confirmLabel="Delete note"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </AppLayout>
  );
}
