import type { EmptyStateProps } from "./index.ts";

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-sm border border-dashed border-rule px-6 py-20 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-paper-dim text-ink-soft">{icon}</span>
      <h2 className="font-display text-xl text-ink">{title}</h2>
      <p className="max-w-sm font-sans text-sm text-ink-soft">{description}</p>
      {action}
    </div>
  );
}
