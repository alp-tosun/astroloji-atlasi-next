'use client';

import { useEffect, useRef, useId, ReactNode } from 'react';

interface ToolModalProps {
  open: boolean;
  onClose: () => void;
  icon: string;
  title: string;
  children: ReactNode;
  onShare?: () => void;
  showShare?: boolean;
  shareLabel?: string;
}

export function ToolModal({
  open,
  onClose,
  icon,
  title,
  children,
  onShare,
  showShare,
  shareLabel,
}: ToolModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-[overlayIn_0.15s_ease-out]"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div className="w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl border border-border bg-surface shadow-2xl animate-[modalIn_0.25s_ease-out]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xl" aria-hidden="true">{icon}</span>
            <h3 id={titleId} className="text-lg font-semibold text-text truncate">{title}</h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-muted hover:text-text transition-colors text-xl leading-none ml-3 shrink-0"
          >
            &times;
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          {children}
        </div>

        {/* Sticky share footer */}
        {showShare && onShare && (
          <div className="border-t border-border px-5 py-3 flex justify-end shrink-0">
            <button
              onClick={onShare}
              className="text-sm text-accent hover:text-accent/80 transition-colors font-medium"
            >
              {shareLabel || 'Paylas'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
