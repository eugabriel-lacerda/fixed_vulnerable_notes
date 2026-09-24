import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { clearSession, getSessionUser } from "../../utils/session";

export function initialsFrom(email: string) {
  const name = email.split("@")[0] ?? email;
  return name.slice(0, 2).toUpperCase();
}

export function useUserMenu() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const user = getSessionUser();

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  function handleLogout() {
    clearSession();
    navigate("/login");
  }

  return {
    open,
    setOpen,
    menuRef,
    user,
    handleLogout,
  };
}
