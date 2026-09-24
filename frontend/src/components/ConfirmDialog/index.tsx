import { AlertTriangle } from "lucide-react";
import { Button } from "../Button/index.tsx";
import { useConfirmDialog } from "./index.ts";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Delete",
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const { dialogRef } = useConfirmDialog(open, onCancel);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-6">
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
        tabIndex={-1}
        className="w-full max-w-sm rounded-sm border border-rule bg-paper p-6 shadow-popover outline-none"
      >
        <div className="mb-4 flex items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-error-bg text-error">
            <AlertTriangle className="size-4" aria-hidden="true" />
          </span>
          <h2 id="confirm-dialog-title" className="font-display text-lg font-medium">
            {title}
          </h2>
        </div>
        <p id="confirm-dialog-description" className="mb-6 font-sans text-sm text-ink-soft">
          {description}
        </p>
        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" size="sm" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button type="button" variant="danger" size="sm" onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
