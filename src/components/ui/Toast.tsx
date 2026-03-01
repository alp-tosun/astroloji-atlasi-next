'use client';

import { useToastStore, type ToastType } from '@/stores/toast-store';

const ICONS: Record<ToastType, string> = {
  success: '✓',
  error: '✕',
  warning: '!',
  info: 'i',
};

const COLORS: Record<ToastType, string> = {
  success: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400',
  error: 'border-red-500/40 bg-red-500/10 text-red-400',
  warning: 'border-amber-500/40 bg-amber-500/10 text-amber-400',
  info: 'border-accent/40 bg-accent/10 text-accent',
};

const ICON_BG: Record<ToastType, string> = {
  success: 'bg-emerald-500/20 text-emerald-400',
  error: 'bg-red-500/20 text-red-400',
  warning: 'bg-amber-500/20 text-amber-400',
  info: 'bg-accent/20 text-accent',
};

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);
  const removeToast = useToastStore((s) => s.removeToast);

  if (toasts.length === 0) return null;

  return (
    <div aria-live="polite" aria-atomic="false" className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="alert"
          className={`pointer-events-auto flex items-center gap-3 rounded-xl border px-4 py-3 shadow-lg backdrop-blur-xl animate-[fadeSlideIn_0.25s_ease-out] ${COLORS[toast.type]}`}
        >
          <span aria-hidden="true" className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${ICON_BG[toast.type]}`}>
            {ICONS[toast.type]}
          </span>
          <p className="text-sm text-text flex-1">{toast.message}</p>
          <button
            onClick={() => removeToast(toast.id)}
            aria-label="Dismiss"
            className="text-muted hover:text-text text-sm shrink-0 transition-colors"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
