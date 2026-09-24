import { AppHeader } from "../AppHeader";
import type { AppLayoutProps } from "./index.ts";

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-svh">
      <AppHeader />
      <main className="mx-auto max-w-5xl px-6 py-10">{children}</main>
    </div>
  );
}
