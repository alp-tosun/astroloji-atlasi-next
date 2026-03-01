'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { isNative } from '@/lib/capacitor/platform';
import {
  getOfferings,
  purchasePackage,
  restorePurchases,
} from '@/lib/capacitor/revenuecat';

interface PaywallModalProps {
  open: boolean;
  onClose: () => void;
  onPurchased: () => void;
  t: (key: string) => string;
  lang?: string;
}

interface PackageInfo {
  identifier: string;
  offeringIdentifier: string;
  title: string;
  price: string;
  period: string;
}

export function PaywallModal({ open, onClose, onPurchased, t, lang = 'tr' }: PaywallModalProps) {
  const [packages, setPackages] = useState<PackageInfo[]>([]);
  const [selectedPkg, setSelectedPkg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open || !isNative()) return;

    const loadOfferings = async () => {
      const offering = await getOfferings();
      if (offering?.availablePackages) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const pkgs: PackageInfo[] = offering.availablePackages.map((p: any) => ({
          identifier: p.identifier,
          offeringIdentifier: p.offeringIdentifier,
          title: p.product.title,
          price: p.product.priceString,
          period: p.product.subscriptionPeriod || '',
        }));
        setPackages(pkgs);
        if (pkgs.length > 0) setSelectedPkg(pkgs[0].identifier);
      }
    };
    loadOfferings();
  }, [open]);

  const handlePurchase = async () => {
    if (!selectedPkg) return;
    const pkg = packages.find((p) => p.identifier === selectedPkg);
    if (!pkg) return;

    setLoading(true);
    setError('');
    try {
      const success = await purchasePackage({
        identifier: pkg.identifier,
        offeringIdentifier: pkg.offeringIdentifier,
      });
      if (success) {
        onPurchased();
        onClose();
      } else {
        setError(t('paywall_error'));
      }
    } catch {
      setError(t('paywall_error'));
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    setRestoring(true);
    setError('');
    try {
      const success = await restorePurchases();
      if (success) {
        onPurchased();
        onClose();
      } else {
        setError(t('paywall_restore_none'));
      }
    } catch {
      setError(t('paywall_error'));
    } finally {
      setRestoring(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={t('paywall_modal_title')}>
      <div className="space-y-4">
        {/* Features list */}
        <div className="space-y-2">
          {['paywall_feature_1', 'paywall_feature_2', 'paywall_feature_3', 'paywall_feature_4'].map((key) => (
            <div key={key} className="flex items-center gap-2">
              <span className="text-success text-sm">&#10003;</span>
              <span className="text-sm text-text/80">{t(key)}</span>
            </div>
          ))}
        </div>

        {/* Packages */}
        {isNative() && packages.length > 0 ? (
          <div className="space-y-2">
            {packages.map((pkg) => (
              <button
                key={pkg.identifier}
                onClick={() => setSelectedPkg(pkg.identifier)}
                className={`w-full rounded-xl border p-3 text-left transition-colors ${
                  selectedPkg === pkg.identifier
                    ? 'border-accent bg-accent/10'
                    : 'border-border hover:border-accent/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-text">{pkg.title}</span>
                  <span className="text-sm font-semibold text-accent">{pkg.price}</span>
                </div>
              </button>
            ))}
          </div>
        ) : !isNative() ? (
          <div className="rounded-xl bg-card/50 border border-border p-3 text-center">
            <p className="text-xs text-muted">{t('paywall_web_hint')}</p>
          </div>
        ) : null}

        {error && (
          <p className="text-sm text-red-400 bg-red-400/10 rounded-lg px-3 py-2">{error}</p>
        )}

        {/* Actions */}
        {isNative() && (
          <>
            <Button
              onClick={handlePurchase}
              loading={loading}
              disabled={!selectedPkg || packages.length === 0}
              className="w-full"
            >
              {t('paywall_subscribe')}
            </Button>

            <button
              onClick={handleRestore}
              disabled={restoring}
              className="w-full text-center text-xs text-muted hover:text-text transition-colors py-2"
            >
              {restoring ? '...' : t('paywall_restore')}
            </button>
          </>
        )}

        {/* Legal links */}
        <div className="flex justify-center gap-4 pt-2 border-t border-border/30">
          <Link href={`/${lang}/legal/terms`} className="text-[10px] text-muted/60 hover:text-muted">
            {t('settings_terms')}
          </Link>
          <Link href={`/${lang}/legal/privacy`} className="text-[10px] text-muted/60 hover:text-muted">
            {t('settings_privacy_policy')}
          </Link>
        </div>
      </div>
    </Modal>
  );
}
