"use client";

import { useEffect } from "react";
import { useStore } from "@/lib/store";

export function ToastViewport() {
  const toasts = useStore((s) => s.toasts);
  const dismiss = useStore((s) => s.dismissToast);

  useEffect(() => {
    // Toasts auto-dismiss in store; this is just for display
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
      {toasts.map((t) => {
        const tone =
          t.tone === "success"
            ? "border-emerald-300 bg-white"
            : t.tone === "warn"
              ? "border-amber-300 bg-white"
              : t.tone === "alert"
                ? "border-rose-300 bg-white"
                : "border-slate-300 bg-white";
        const accent =
          t.tone === "success"
            ? "bg-emerald-500"
            : t.tone === "warn"
              ? "bg-amber-500"
              : t.tone === "alert"
                ? "bg-rose-500"
                : "bg-slate-700";
        return (
          <div
            key={t.id}
            className={`pointer-events-auto border ${tone} rounded-lg overflow-hidden shadow-sm flex animate-[fadeIn_120ms_ease-out]`}
          >
            <div className={`w-1 ${accent}`} />
            <div className="flex-1 p-3 pr-8 relative">
              <p className="text-sm font-medium text-slate-900">{t.title}</p>
              {t.description && (
                <p className="mt-0.5 text-xs text-slate-600 leading-relaxed">
                  {t.description}
                </p>
              )}
              <button
                onClick={() => dismiss(t.id)}
                className="absolute top-2 right-2 text-slate-400 hover:text-slate-700 text-sm leading-none"
                aria-label="閉じる"
              >
                ×
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
