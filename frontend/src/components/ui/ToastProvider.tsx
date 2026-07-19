"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";

type ToastType = "error" | "success";
type Toast = { id: number; message: string; type: ToastType; leaving: boolean };

type ToastContextValue = {
  showError: (message: string) => void;
  showSuccess: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

// Components call this to pop a toast, e.g. `useToast().showError("...")`.
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

const VISIBLE_MS = 3000; // how long a toast stays before sliding away
const EXIT_MS = 300; // must match the toast-out animation duration

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);

  // Trigger the exit animation, then drop the toast from the list.
  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.map((t) => (t.id === id ? { ...t, leaving: true } : t)));
    setTimeout(() => {
      setToasts((current) => current.filter((t) => t.id !== id));
    }, EXIT_MS);
  }, []);

  const push = useCallback(
    (message: string, type: ToastType) => {
      const id = nextId.current++;
      setToasts((current) => [...current, { id, message, type, leaving: false }]);
      setTimeout(() => dismiss(id), VISIBLE_MS);
    },
    [dismiss],
  );

  const value: ToastContextValue = {
    showError: (message) => push(message, "error"),
    showSuccess: (message) => push(message, "success"),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}

      {/* Fixed stack at the top-center. pointer-events-none lets clicks pass
          through the empty area; individual toasts re-enable their own events. */}
      <div className="pointer-events-none fixed inset-x-0 top-5 z-50 flex flex-col items-center gap-2 px-4">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto max-w-sm rounded-lg px-5 py-3 text-sm font-medium text-white shadow-lg ${
              toast.type === "error" ? "bg-red-600" : "bg-root-accent"
            } ${toast.leaving ? "animate-toast-out" : "animate-toast-in"}`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
