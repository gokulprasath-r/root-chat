"use client";

import { useEffect } from "react";

type ConfirmDialogProps = {
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onClose: () => void;
  danger?: boolean; // red confirm button for destructive actions
  loading?: boolean; // disables the buttons and shows the busy label
  loadingLabel?: string;
};

// Small yes/no dialog used for logout, clear-chat and delete-account confirms.
// Sits above the regular modals (higher z-index) so it can open on top of them.
export default function ConfirmDialog({
  title,
  message,
  confirmLabel,
  onConfirm,
  onClose,
  danger,
  loading,
  loadingLabel,
}: ConfirmDialogProps) {
  useEffect(() => {
    // Don't let Escape close the dialog while an action is in progress.
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !loading && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, loading]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      onClick={() => !loading && onClose()}
    >
      <div className="absolute inset-0 bg-black/40" />

      <div
        className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-root-primary">{title}</h2>
        <p className="mt-2 text-sm text-root-secondary">{message}</p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-full border border-root-secondary/40 px-5 py-2.5 text-sm font-semibold text-root-primary hover:bg-black/5 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`rounded-full px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-70 ${
              danger ? "bg-red-600 hover:bg-red-700" : "bg-root-primary hover:bg-root-secondary"
            }`}
          >
            {loading ? (loadingLabel ?? confirmLabel) : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
