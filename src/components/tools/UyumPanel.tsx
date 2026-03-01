'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { ResultBox } from '@/components/analysis/ResultBox';
import { ZODIAC_SIGNS_TR } from '@/types/astrology';

interface UyumPanelProps {
  t: (k: string) => string;
  callApi: (e: string, b: Record<string, unknown>) => Promise<void>;
  result: string;
  resultLoading: boolean;
  streaming: boolean;
  profile: Record<string, string | undefined>;
}

export function UyumPanel({ t, callApi, result, resultLoading, streaming, profile }: UyumPanelProps) {
  const [burc1, setBurc1] = useState(profile.burc || '');
  const [burc2, setBurc2] = useState('');
  const [iliski, setIliski] = useState('romantik');

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold text-text mb-1">{t('panel_uyum_title')}</h3>
        <p className="text-xs text-muted">{t('panel_uyum_hint')}</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Select label={t('label_burc1')} value={burc1} onChange={(e) => setBurc1(e.target.value)}>
          <option value="">{t('opt_secipiz')}</option>
          {ZODIAC_SIGNS_TR.map((b) => <option key={b} value={b}>{b}</option>)}
        </Select>
        <Select label={t('label_burc2')} value={burc2} onChange={(e) => setBurc2(e.target.value)}>
          <option value="">{t('opt_secipiz')}</option>
          {ZODIAC_SIGNS_TR.map((b) => <option key={b} value={b}>{b}</option>)}
        </Select>
      </div>
      <Select label={t('label_iliski')} value={iliski} onChange={(e) => setIliski(e.target.value)}>
        <option value="romantik">{t('opt_romantik')}</option>
        <option value="arkadaslik">{t('opt_arkadaslik')}</option>
        <option value="is">{t('opt_is_iliski')}</option>
        <option value="aile">{t('opt_aile_iliski')}</option>
      </Select>
      <Button onClick={() => callApi('/api/uyum', { burc1, burc2, iliski })} loading={resultLoading}>
        {t('btn_uyum_analiz')}
      </Button>
      <ResultBox content={result} loading={resultLoading} streaming={streaming} />
    </div>
  );
}
