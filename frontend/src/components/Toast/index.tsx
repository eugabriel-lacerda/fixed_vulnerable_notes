import type { ReactNode } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { ToastContext, useToastProvider } from "./index.ts";

export { useToast } from "./index.ts";

export function ToastProvider({ children }: { children: ReactNode }) {
  const { toasts, showToast } = useToastProvider();

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex flex-col items-center gap-2 px-4">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className={`pointer-events-auto flex items-center gap-2 rounded-sm border px-4 py-3 font-sans text-sm shadow-popover ${
              toast.kind === "success"
                ? "border-accent-soft bg-accent text-paper"
                : "border-error bg-error text-paper"
            }`}
          >
            {toast.kind === "success" ? (
              <CheckCircle2 className="size-4 shrink-0 text-paper" aria-hidden="true" />
            ) : (
              <XCircle className="size-4 shrink-0 text-paper" aria-hidden="true" />
            )}
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
