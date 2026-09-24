import { LogOut } from "lucide-react";
import { initialsFrom, useUserMenu } from "./index.ts";

export function UserMenu() {
  const { open, setOpen, menuRef, user, handleLogout } = useUserMenu();

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex size-9 items-center justify-center rounded-full border border-rule bg-paper-dim font-mono text-xs font-medium text-ink transition-colors hover:border-ink"
      >
        {user ? initialsFrom(user.email) : "?"}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-11 z-40 w-56 rounded-sm border border-rule bg-paper py-1.5 shadow-popover"
        >
          {user && (
            <div className="border-b border-rule px-3.5 py-2.5">
              <p className="font-mono text-[11px] uppercase tracking-wider text-ink-soft">Signed in as</p>
              <p className="mt-0.5 truncate font-sans text-sm text-ink">{user.email}</p>
            </div>
          )}
          <button
            type="button"
            role="menuitem"
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left font-sans text-sm text-ink transition-colors hover:bg-paper-dim"
          >
            <LogOut className="size-4 text-ink-soft" aria-hidden="true" />
            Log out
          </button>
        </div>
      )}
    </div>
  );
}
