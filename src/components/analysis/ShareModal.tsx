'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { StoryCard } from './StoryCard';
import { isNative } from '@/lib/capacitor/platform';

interface ShareModalProps {
  open: boolean;
  onClose: () => void;
  content: string;
  t: (key: string) => string;
  lang: string;
  burc?: string;
}

export function ShareModal({ open, onClose, content, t, lang, burc }: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    try {
      const { Share } = await import('@capacitor/share');
      await Share.share({
        title: t('site_name'),
        text: content,
      });
    } catch {
      // User cancelled or share failed — fallback to copy
      handleCopy();
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={t('paylasim_baslik')}>
      <div className="max-h-60 overflow-y-auto rounded-xl bg-card p-3 text-sm text-text/80 whitespace-pre-wrap mb-4">
        {content}
      </div>

      {isNative() ? (
        <div className="space-y-2">
          <Button onClick={handleNativeShare} className="w-full">
            {t('paylasim_paylas') !== 'paylasim_paylas' ? t('paylasim_paylas') : 'Paylas'}
          </Button>
          <Button onClick={handleCopy} className="w-full" variant="secondary">
            {copied ? t('paylasim_kopyalandi') : t('paylasim_kopyala')}
          </Button>
        </div>
      ) : (
        <Button onClick={handleCopy} className="w-full">
          {copied ? t('paylasim_kopyalandi') : t('paylasim_kopyala')}
        </Button>
      )}

      {/* Visual download section */}
      <div className="mt-4 pt-4 border-t border-border">
        <h4 className="text-sm font-medium text-text mb-3">{t('paylasim_gorsel_indir')}</h4>
        <StoryCard content={content} burc={burc} t={t} lang={lang} />
      </div>
    </Modal>
  );
}
