import { Search, X } from "lucide-react";
import type { SearchInputProps } from "./index.ts";

export function SearchInput({ value, onChange, onSubmit, onClear }: SearchInputProps) {
  return (
    <form onSubmit={onSubmit} className="relative w-full max-w-sm">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-soft" aria-hidden="true" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search by title"
        aria-label="Search notes by title"
        className="w-full rounded-sm border border-rule bg-paper py-2.5 pl-9 pr-9 font-sans text-sm text-ink outline-none transition-colors focus:border-ink"
      />
      {value && (
        <button
          type="button"
          onClick={onClear}
          aria-label="Clear search"
          className="absolute right-2.5 top-1/2 flex size-5 -translate-y-1/2 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-paper-dim hover:text-ink"
        >
          <X className="size-3.5" aria-hidden="true" />
        </button>
      )}
    </form>
  );
}
