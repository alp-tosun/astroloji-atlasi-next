'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { ResultBox } from '@/components/analysis/ResultBox';

interface GunlukPanelProps {
  t: (k: string) => string;
  callApi: (e: string, b: Record<string, unknown>) => Promise<void>;
  result: string;
  resultLoading: boolean;
  streaming: boolean;
  profile: Record<string, string | undefined>;
}

export function GunlukPanel({ t, callApi, result, resultLoading, streaming, profile }: GunlukPanelProps) {
  const [odak, setOdak] = useState('genel');
  const burcMissing = !profile.burc;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold text-text mb-1">{t('panel_gunluk_title')}</h3>
        <p className="text-xs text-muted">{t('panel_gunluk_hint')}</p>
      </div>
      <Select label={t('label_gunluk_odak')} value={odak} onChange={(e) => setOdak(e.target.value)}>
        <option value="genel">{t('opt_genel')}</option>
        <option value="ask">{t('opt_odak_ask')}</option>
        <option value="is">{t('opt_odak_is')}</option>
        <option value="saglik">{t('opt_odak_saglik')}</option>
        <option value="para">{t('opt_odak_para')}</option>
      </Select>
      {burcMissing && (
        <p className="text-xs text-amber-400">{t('gunluk_burc_uyari') !== 'gunluk_burc_uyari' ? t('gunluk_burc_uyari') : 'Profilinize burcunuzu ekleyin.'}</p>
      )}
      <Button
        onClick={() => callApi('/api/gunluk', { burc: profile.burc || 'Koç', odak })}
        loading={resultLoading}
        disabled={burcMissing}
      >
        {t('btn_gunluk_analiz')}
      </Button>
      <ResultBox content={result} loading={resultLoading} streaming={streaming} />
    </div>
  );
}
