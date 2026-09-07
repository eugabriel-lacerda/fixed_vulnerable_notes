import { Link } from "react-router-dom";
import { useNotes } from "./index.ts";

export function Notes() {
  const { notes, query, setQuery, loading, error, handleSearch } = useNotes();

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <div className="mb-10 flex items-baseline justify-between">
        <Link to="/notes" className="font-display text-xl font-medium text-ink no-underline">
          Vuln Notes
        </Link>
        <Link
          to="/notes/new"
          className="rounded-sm bg-ink px-4 py-2 font-sans text-sm font-semibold text-paper no-underline transition-colors hover:bg-accent"
        >
          New note
        </Link>
      </div>

      <form onSubmit={handleSearch} className="group relative mb-8">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by title"
          className="w-full border-0 border-b border-rule bg-transparent px-0.5 pb-2.5 pt-1.5 font-sans text-[15px] text-ink outline-none focus-visible:outline-none focus:border-transparent"
        />
        <span
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-accent transition-transform duration-300 ease-out group-focus-within:scale-x-100"
        />
      </form>

      {error && (
        <p role="alert" className="mb-6 border-l-2 border-error bg-error-bg px-2.5 py-2 font-mono text-[13px] text-error">
          {error}
        </p>
      )}

      {loading && <p className="font-sans text-sm text-ink-soft">Loading notes…</p>}

      {!loading && notes.length === 0 && !error && (
        <p className="font-sans text-sm text-ink-soft">
          No notes yet. <Link to="/notes/new" className="text-accent">Write your first one.</Link>
        </p>
      )}

      <ul className="flex flex-col divide-y divide-rule">
        {notes.map((note) => (
          <li key={note.id}>
            <Link
              to={`/notes/${note.id}`}
              className="flex items-baseline justify-between gap-4 py-4 no-underline"
            >
              <span className="font-display text-lg text-ink">{note.title}</span>
              {note.created_at && (
                <span className="shrink-0 font-mono text-xs text-ink-soft">
                  {new Date(note.created_at).toLocaleDateString()}
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
