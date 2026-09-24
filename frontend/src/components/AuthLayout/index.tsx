import { Link } from "react-router-dom";
import type { AuthLayoutProps } from "./index.ts";

export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center px-6 py-16">
      <Link to="/login" className="mb-10 font-display text-xl font-medium text-ink no-underline">
        Vuln Notes
      </Link>

      <div className="w-full max-w-95">
        <h1 className="font-display text-[28px] font-medium italic">{title}</h1>
        <p className="mb-8 mt-2 font-sans text-sm text-ink-soft">{subtitle}</p>

        {children}

        {footer && <div className="mt-7 flex flex-col gap-2.5 text-sm text-ink-soft">{footer}</div>}
      </div>
    </div>
  );
}
