import { NotebookPen, SearchX } from "lucide-react";
import { Link } from "react-router-dom";
import { AppLayout } from "../../components/AppLayout/index.tsx";
import { SearchInput } from "../../components/SearchInput/index.tsx";
import { NoteCard } from "../../components/NoteCard/index.tsx";
import { EmptyState } from "../../components/EmptyState/index.tsx";
import { Button } from "../../components/Button/index.tsx";
import { useNotes } from "./index.ts";

export function Notes() {
  const { notes, query, setQuery, searchedQuery, loading, error, handleSearch, handleClearSearch } = useNotes();

  const isSearching = searchedQuery.length > 0;

  return (
    <AppLayout>
      <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl italic">Your notes</h1>
          <p className="mt-1 font-sans text-sm text-ink-soft">Capture ideas, findings and anything worth remembering.</p>
        </div>
        <SearchInput value={query} onChange={setQuery} onSubmit={handleSearch} onClear={handleClearSearch} />
      </div>

      {error && (
        <p role="alert" className="mb-6 border-l-2 border-error bg-error-bg px-2.5 py-2 font-mono text-[13px] text-error">
          {error}
        </p>
      )}

      {loading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-44 animate-pulse rounded-sm border border-rule bg-paper-dim" />
          ))}
        </div>
      )}

      {!loading && !error && notes.length === 0 && !isSearching && (
        <EmptyState
          icon={<NotebookPen className="size-5" aria-hidden="true" />}
          title="No notes yet"
          description="Everything you write ends up here. Start with your first note."
          action={
            <Link
              to="/notes/new"
              className="mt-2 inline-flex items-center justify-center rounded-sm bg-ink px-4 py-2 font-sans text-sm font-semibold text-paper no-underline transition-colors hover:bg-accent"
            >
              Create your first note
            </Link>
          }
        />
      )}

      {!loading && !error && notes.length === 0 && isSearching && (
        <EmptyState
          icon={<SearchX className="size-5" aria-hidden="true" />}
          title="No notes found"
          description={`Nothing matches "${searchedQuery}". Try a different title.`}
          action={
            <Button size="sm" variant="secondary" onClick={handleClearSearch}>
              Clear search
            </Button>
          }
        />
      )}

      {!loading && !error && notes.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {notes.map((note) => (
            <NoteCard key={note.id} note={note} />
          ))}
        </div>
      )}
    </AppLayout>
  );
}
