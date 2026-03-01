'use client';

import { Button } from '@/components/ui/Button';

interface PaywallOverlayProps {
  onUnlock: () => void;
  t: (key: string) => string;
}

export function PaywallOverlay({ onUnlock, t }: PaywallOverlayProps) {
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-2xl bg-bg/80 backdrop-blur-md">
      <div className="text-center p-6">
        <h3 className="text-base font-semibold text-text mb-2">{t('paywall_title')}</h3>
        <p className="text-xs text-muted mb-4">{t('paywall_desc')}</p>
        <Button variant="premium" onClick={onUnlock}>
          {t('paywall_btn')}
        </Button>
        <p className="text-xs text-muted mt-2">{t('paywall_hint')}</p>
      </div>
    </div>
  );
}
