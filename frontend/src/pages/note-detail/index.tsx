import { Link } from "react-router-dom";
import { useNoteDetail } from "./index.ts";

export function NoteDetail() {
  const { isNew, title, setTitle, body, setBody, editing, setEditing, loading, error, handleSave, handleDelete } =
    useNoteDetail();

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-12">
        <p className="font-sans text-sm text-ink-soft">Loading note…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <div className="mb-10 flex items-baseline justify-between">
        <Link to="/notes" className="font-mono text-xs uppercase tracking-wider text-ink-soft no-underline">
          ← Back to notes
        </Link>
      </div>

      {error && (
        <p role="alert" className="mb-6 border-l-2 border-error bg-error-bg px-2.5 py-2 font-mono text-[13px] text-error">
          {error}
        </p>
      )}

      {editing ? (
        <form onSubmit={handleSave} className="flex flex-col gap-5">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            required
            className="border-0 border-b border-rule bg-transparent px-0.5 pb-2.5 pt-1.5 font-display text-2xl italic text-ink outline-none focus-visible:outline-none focus:border-accent"
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write your note…"
            rows={12}
            className="resize-none border-0 bg-transparent font-sans text-[15px] leading-relaxed text-ink outline-none focus-visible:outline-none"
          />
          <div className="flex gap-3">
            <button
              type="submit"
              className="rounded-sm bg-ink px-5 py-3 font-sans text-[15px] font-semibold text-paper transition-colors hover:bg-accent"
            >
              Save note
            </button>
            {!isNew && (
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="rounded-sm border border-rule px-5 py-3 font-sans text-[15px] font-semibold text-ink-soft transition-colors hover:border-ink hover:text-ink"
              >
                Cancel
              </button>
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
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="rounded-sm border border-rule px-5 py-2.5 font-sans text-sm font-semibold text-ink transition-colors hover:border-ink"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="rounded-sm border border-error/30 px-5 py-2.5 font-sans text-sm font-semibold text-error transition-colors hover:border-error"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
