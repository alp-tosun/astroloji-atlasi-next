'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ResultBox } from '@/components/analysis/ResultBox';
import { indirge, harfToplam, pythagorean, SESLI } from '@/lib/numerology';
import type { NumerologyNumbers } from '@/types/analysis';

interface NumerologiPanelProps {
  t: (k: string) => string;
  callApi: (e: string, b: Record<string, unknown>) => Promise<void>;
  result: string;
  resultLoading: boolean;
  streaming: boolean;
  numNumbers: NumerologyNumbers | null;
  setNumNumbers: (n: NumerologyNumbers | null) => void;
}

export function NumerologiPanel({ t, callApi, result, resultLoading, streaming, numNumbers, setNumNumbers }: NumerologiPanelProps) {
  const [ad, setAd] = useState('');
  const [tarih, setTarih] = useState('');

  const calculate = () => {
    if (!ad || !tarih) return;
    const yasamYolu = indirge(tarih.replace(/-/g, '').split('').reduce((s, d) => s + parseInt(d), 0));
    const kader = indirge(harfToplam(ad));
    const ruhArzu = indirge(ad.toLowerCase().split('').reduce((s, c) => s + (SESLI.has(c) ? (pythagorean[c] || 0) : 0), 0));
    const kisilik = indirge(ad.toLowerCase().split('').reduce((s, c) => (!SESLI.has(c) && pythagorean[c]) ? s + pythagorean[c] : s, 0));
    const nums = { yasamYolu, kader, ruhArzu, kisilik };
    setNumNumbers(nums);
    callApi('/api/numerology', { numbers: nums, ad, tarih });
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold text-text mb-1">{t('panel_num_title')}</h3>
        <p className="text-xs text-muted">{t('panel_num_hint')}</p>
      </div>
      <Input label={t('label_ad_soyad')} placeholder={t('ph_ad_soyad')} value={ad} onChange={(e) => setAd(e.target.value)} />
      <Input label={t('label_dogum_tarih')} type="date" value={tarih} onChange={(e) => setTarih(e.target.value)} />
      <Button onClick={calculate} loading={resultLoading}>{t('btn_num_hesapla')}</Button>
      {numNumbers && (
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: t('num_yasam'), val: numNumbers.yasamYolu },
            { label: t('num_kader'), val: numNumbers.kader },
            { label: t('num_ruh'), val: numNumbers.ruhArzu },
            { label: t('num_kisilik'), val: numNumbers.kisilik },
          ].map((n) => (
            <div key={n.label} className="text-center rounded-xl bg-card/50 border border-border p-3">
              <div className="text-2xl font-bold text-accent">{n.val}</div>
              <div className="text-xs text-muted mt-1">{n.label}</div>
            </div>
          ))}
        </div>
      )}
      <ResultBox content={result} loading={resultLoading} streaming={streaming} />
    </div>
  );
}
