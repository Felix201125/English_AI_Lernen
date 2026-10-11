"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

export type ToastKind = "success" | "error" | "loading" | "info";

type ToastItem = {
  id: string;
  kind: ToastKind;
  message: string;
};

type ToastContextValue = {
  toasts: ToastItem[];
  toast: (kind: ToastKind, message: string) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  loading: (message: string) => void;
  dismiss: (id: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (kind: ToastKind, message: string) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setToasts((prev) => [...prev.slice(-4), { id, kind, message }]);
      if (kind !== "loading") {
        window.setTimeout(() => dismiss(id), 4500);
      }
    },
    [dismiss]
  );

  const value = useMemo<ToastContextValue>(
    () => ({
      toasts,
      toast,
      success: (m) => toast("success", m),
      error: (m) => toast("error", m),
      loading: (m) => toast("loading", m),
      dismiss,
    }),
    [toasts, toast, dismiss]
  );

  const liveMessage =
    toasts.length > 0 ? toasts[toasts.length - 1].message : "";

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {liveMessage}
      </div>
      <div
        className="pointer-events-none fixed bottom-20 right-4 z-[100] flex w-[min(100%,22rem)] flex-col gap-2 md:bottom-6"
        aria-hidden={toasts.length === 0}
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto rounded-xl border px-4 py-3 text-sm shadow-lg backdrop-blur",
              t.kind === "success" &&
                "border-emerald-400/40 bg-emerald-950/90 text-emerald-100",
              t.kind === "error" &&
                "border-rose-400/40 bg-rose-950/90 text-rose-100",
              t.kind === "loading" &&
                "border-sky-400/40 bg-sky-950/90 text-sky-100",
              t.kind === "info" &&
                "border-white/20 bg-[#0d1526]/95 text-slate-100"
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <p>{t.message}</p>
              <button
                type="button"
                className="text-xs opacity-70 hover:opacity-100"
                onClick={() => dismiss(t.id)}
                aria-label="Hinweis schließen"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast muss innerhalb von ToastProvider liegen");
  return ctx;
}
