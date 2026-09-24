import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { UserMenu } from "../UserMenu/index.tsx";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-rule bg-paper/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3.5">
        <Link to="/notes" className="font-display text-lg font-medium text-ink no-underline">
          Vuln Notes
        </Link>

        <div className="flex items-center gap-3">
          <Link
            to="/notes/new"
            className="flex items-center gap-1.5 rounded-sm bg-ink px-3.5 py-2 font-sans text-sm font-semibold text-paper no-underline transition-colors hover:bg-accent"
          >
            <Plus className="size-4" aria-hidden="true" />
            New note
          </Link>
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
