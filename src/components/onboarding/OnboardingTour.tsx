'use client';

import { useState, useEffect, useCallback } from 'react';

interface OnboardingTourProps {
  open: boolean;
  onClose: () => void;
  t: (key: string) => string;
}

interface StepConfig {
  titleKey: string;
  descKey: string;
  target: string | null; // data-tour attribute value, null for centered card
}

const STEPS: StepConfig[] = [
  { titleKey: 'onboard_welcome_title', descKey: 'onboard_welcome_desc', target: null },
  { titleKey: 'onboard_profile_title', descKey: 'onboard_profile_desc', target: 'profile' },
  { titleKey: 'onboard_tools_title', descKey: 'onboard_tools_desc', target: 'tools' },
  { titleKey: 'onboard_planet_title', descKey: 'onboard_planet_desc', target: 'planet-band' },
  { titleKey: 'onboard_done_title', descKey: 'onboard_done_desc', target: null },
];

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export function OnboardingTour({ open, onClose, t }: OnboardingTourProps) {
  const [step, setStep] = useState(0);
  const [targetRect, setTargetRect] = useState<Rect | null>(null);
  const [visible, setVisible] = useState(false);

  // Measure target element
  const measureTarget = useCallback(() => {
    const config = STEPS[step];
    if (!config.target) {
      setTargetRect(null);
      return;
    }
    const el = document.querySelector(`[data-tour="${config.target}"]`);
    if (el) {
      const r = el.getBoundingClientRect();
      setTargetRect({ top: r.top, left: r.left, width: r.width, height: r.height });
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      setTargetRect(null);
    }
  }, [step]);

  // Open animation
  useEffect(() => {
    if (open) {
      setStep(0);
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [open]);

  // Re-measure on step change or resize
  useEffect(() => {
    if (!open) return;
    // Small delay to let scroll finish
    const timer = setTimeout(measureTarget, 300);
    window.addEventListener('resize', measureTarget);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', measureTarget);
    };
  }, [open, step, measureTarget]);

  if (!open) return null;

  const config = STEPS[step];
  const isFirst = step === 0;
  const isLast = step === STEPS.length - 1;
  const isCentered = config.target === null;

  const handleNext = () => {
    if (isLast) {
      onClose();
    } else {
      setStep((s) => s + 1);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  // Spotlight box-shadow approach
  const PAD = 8;
  const RADIUS = 12;

  const spotlightStyle: React.CSSProperties = targetRect
    ? {
        position: 'fixed',
        top: targetRect.top - PAD,
        left: targetRect.left - PAD,
        width: targetRect.width + PAD * 2,
        height: targetRect.height + PAD * 2,
        borderRadius: RADIUS,
        boxShadow: '0 0 0 9999px rgba(0,0,0,0.7)',
        zIndex: 101,
        pointerEvents: 'none',
        transition: 'all 0.4s ease',
      }
    : {};

  // Tooltip positioning near the spotlight
  const getTooltipStyle = (): React.CSSProperties => {
    if (!targetRect || isCentered) {
      return {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 102,
      };
    }

    const viewportH = window.innerHeight;
    const centerY = targetRect.top + targetRect.height / 2;
    const below = centerY < viewportH / 2;

    return {
      position: 'fixed',
      top: below ? targetRect.top + targetRect.height + PAD + 16 : undefined,
      bottom: below ? undefined : viewportH - targetRect.top + PAD + 16,
      left: Math.max(16, Math.min(targetRect.left, window.innerWidth - 360)),
      zIndex: 102,
      maxWidth: 340,
    };
  };

  return (
    <div
      className={`fixed inset-0 z-[100] transition-opacity duration-300 ${
        visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      {/* Dark overlay for centered steps (no spotlight) */}
      {isCentered && (
        <div className="absolute inset-0 bg-black/70" onClick={handleSkip} />
      )}

      {/* Overlay click area for spotlight steps */}
      {!isCentered && (
        <div className="absolute inset-0" onClick={handleSkip} />
      )}

      {/* Spotlight hole */}
      {targetRect && !isCentered && <div style={spotlightStyle} />}

      {/* Tooltip card */}
      <div
        style={getTooltipStyle()}
        className={`rounded-2xl border border-border bg-surface/95 backdrop-blur-md p-5 shadow-2xl transition-all duration-400 ${
          isCentered ? 'w-[90vw] max-w-md' : ''
        }`}
      >
        <h3 className="text-lg font-bold text-text mb-2">{t(config.titleKey)}</h3>
        <p className="text-sm text-muted leading-relaxed mb-5">{t(config.descKey)}</p>

        {/* Step dots */}
        <div className="flex items-center justify-between">
          <div className="flex gap-1.5">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === step ? 'bg-accent' : 'bg-border'
                }`}
              />
            ))}
          </div>

          <div className="flex gap-2">
            {!isLast && (
              <button
                onClick={handleSkip}
                className="px-3 py-1.5 text-xs text-muted hover:text-text transition-colors"
              >
                {t('onboard_skip')}
              </button>
            )}
            <button
              onClick={handleNext}
              className="px-4 py-1.5 text-sm font-medium rounded-lg bg-accent text-white hover:bg-accent/90 transition-colors"
            >
              {isLast ? t('onboard_finish') : t('onboard_next')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
