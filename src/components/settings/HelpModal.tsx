'use client';

import Link from 'next/link';
import { Modal } from '@/components/ui/Modal';

interface HelpModalProps {
  open: boolean;
  onClose: () => void;
  t: (key: string) => string;
  lang?: string;
}

const FAQ = [
  { q: 'help_q1', a: 'help_a1' },
  { q: 'help_q2', a: 'help_a2' },
  { q: 'help_q3', a: 'help_a3' },
];

export function HelpModal({ open, onClose, t, lang = 'tr' }: HelpModalProps) {
  return (
    <Modal open={open} onClose={onClose} title={t('help_title')}>
      <div className="space-y-4">
        {/* FAQ */}
        <div>
          <h4 className="text-sm font-semibold text-text mb-3">{t('help_faq_title')}</h4>
          <div className="space-y-3">
            {FAQ.map((item) => (
              <div key={item.q} className="rounded-xl bg-card/50 border border-border p-3">
                <p className="text-sm font-medium text-text mb-1">{t(item.q)}</p>
                <p className="text-xs text-muted leading-relaxed">{t(item.a)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Legal links */}
        <div>
          <h4 className="text-sm font-semibold text-text mb-3">{t('settings_legal')}</h4>
          <div className="space-y-2">
            <Link href={`/${lang}/legal/privacy`} onClick={onClose} className="block text-xs text-accent hover:text-accent-light transition-colors">
              {t('settings_privacy_policy')}
            </Link>
            <Link href={`/${lang}/legal/terms`} onClick={onClose} className="block text-xs text-accent hover:text-accent-light transition-colors">
              {t('settings_terms')}
            </Link>
            <Link href={`/${lang}/legal/kvkk`} onClick={onClose} className="block text-xs text-accent hover:text-accent-light transition-colors">
              {t('settings_kvkk')}
            </Link>
          </div>
        </div>

        {/* Contact */}
        <div className="rounded-xl bg-card/50 border border-border p-3 text-center">
          <p className="text-xs text-muted">{t('help_contact')}</p>
        </div>

        {/* Version */}
        <p className="text-center text-[10px] text-muted/50">
          {t('help_version')} 1.0.0
        </p>
      </div>
    </Modal>
  );
}
