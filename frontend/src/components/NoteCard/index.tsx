import { Link } from "react-router-dom";
import type { Note } from "../../types/Note";
import { useNoteCard } from "./index.ts";

export function NoteCard({ note }: { note: Note }) {
  const { preview, date } = useNoteCard(note);

  return (
    <Link
      to={`/notes/${note.id}`}
      className="group flex h-44 flex-col justify-between rounded-sm border border-rule bg-paper p-5 no-underline shadow-card transition-all duration-150 hover:-translate-y-0.5 hover:border-ink-soft hover:shadow-card-hover"
    >
      <div className="flex flex-col gap-2">
        <h2 className="line-clamp-2 font-display text-lg leading-snug text-ink">{note.title}</h2>
        <p className="line-clamp-3 font-sans text-sm leading-relaxed text-ink-soft">{preview}</p>
      </div>
      {date && (
        <span className="font-mono text-[11px] uppercase tracking-wider text-ink-soft/70 group-hover:text-ink-soft">
          {date}
        </span>
      )}
    </Link>
  );
}
