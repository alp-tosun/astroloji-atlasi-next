'use client';

import { useEffect, useRef, useId, ReactNode, useCallback, useState } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  fullScreen?: boolean;
}

export function Modal({ open, onClose, children, title, fullScreen }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const [closing, setClosing] = useState(false);

  // Swipe-down state
  const dragStartY = useRef(0);
  const dragCurrentY = useRef(0);
  const isDragging = useRef(false);

  const closeWithAnimation = useCallback(() => {
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      onClose();
    }, 250);
  }, [onClose]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeWithAnimation();
    };
    if (open) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [open, closeWithAnimation]);

  // Swipe-down to close (mobile only)
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const sheet = sheetRef.current;
    if (!sheet) return;
    if (sheet.scrollTop > 0) return;
    dragStartY.current = e.touches[0].clientY;
    isDragging.current = true;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging.current) return;
    const sheet = sheetRef.current;
    if (!sheet) return;

    dragCurrentY.current = e.touches[0].clientY;
    const diff = dragCurrentY.current - dragStartY.current;

    if (diff > 0) {
      const resistance = Math.min(diff, 300);
      sheet.style.transform = `translateY(${resistance}px)`;
      sheet.style.transition = 'none';
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;
    const sheet = sheetRef.current;
    if (!sheet) return;

    const diff = dragCurrentY.current - dragStartY.current;
    sheet.style.transition = 'transform 0.25s cubic-bezier(0.32, 0.72, 0, 1)';

    if (diff > 100) {
      sheet.style.transform = 'translateY(100%)';
      setTimeout(() => {
        sheet.style.transform = '';
        sheet.style.transition = '';
        onClose();
      }, 250);
    } else {
      sheet.style.transform = 'translateY(0)';
      setTimeout(() => {
        sheet.style.transform = '';
        sheet.style.transition = '';
      }, 250);
    }
  }, [onClose]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? titleId : undefined}
      className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm ${
        closing ? 'animate-[fadeOut_0.25s_ease-out_forwards]' : 'animate-[fadeIn_0.2s_ease-out]'
      }`}
      onClick={(e) => {
        if (e.target === overlayRef.current) closeWithAnimation();
      }}
    >
      <div
        ref={sheetRef}
        className={`w-full sm:max-w-md sm:mx-4 border border-border bg-surface shadow-2xl overflow-hidden ${
          fullScreen
            ? 'h-full sm:h-auto sm:max-h-[85vh] sm:rounded-2xl'
            : 'max-h-[90vh] rounded-t-3xl sm:rounded-2xl'
        } ${closing ? 'animate-[slideDownOut_0.25s_ease-out_forwards] sm:animate-[fadeOut_0.25s_ease-out_forwards]' : 'animate-[slideUp_0.3s_cubic-bezier(0.32,0.72,0,1)] sm:animate-[modalIn_0.25s_ease-out]'}`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Drag handle - mobile only */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden cursor-grab active:cursor-grabbing">
          <div className="w-10 h-1.5 rounded-full bg-border/80" />
        </div>

        <div className="p-5 overflow-y-auto overscroll-contain" style={{
          maxHeight: fullScreen ? 'calc(100vh - 24px)' : 'calc(90vh - 24px)',
          paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))',
        }}>
          {title && (
            <div className="flex items-center justify-between mb-5">
              <h3 id={titleId} className="text-lg font-semibold text-text">{title}</h3>
              <button
                onClick={closeWithAnimation}
                aria-label="Close"
                className="w-9 h-9 rounded-full bg-card flex items-center justify-center text-muted hover:text-text transition-colors min-w-[44px] min-h-[44px]"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}
