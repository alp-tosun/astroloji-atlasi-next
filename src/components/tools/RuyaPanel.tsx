'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { TextArea } from '@/components/ui/TextArea';
import { ResultBox } from '@/components/analysis/ResultBox';

interface RuyaPanelProps {
  t: (k: string) => string;
  callApi: (e: string, b: Record<string, unknown>) => Promise<void>;
  result: string;
  resultLoading: boolean;
  streaming: boolean;
}

const MAX_CHARS = 2000;

export function RuyaPanel({ t, callApi, result, resultLoading, streaming }: RuyaPanelProps) {
  const [metin, setMetin] = useState('');

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold text-text mb-1">{t('panel_ruya_title')}</h3>
        <p className="text-xs text-muted">{t('panel_ruya_hint2')}</p>
      </div>
      <div>
        <TextArea
          label={t('ruya_metin_label')}
          placeholder={t('ph_ruya2')}
          value={metin}
          onChange={(e) => setMetin(e.target.value.slice(0, MAX_CHARS))}
          rows={5}
        />
        <p className="text-xs text-muted mt-1">{MAX_CHARS - metin.length} {t('char_kalan')}</p>
      </div>
      <Button onClick={() => callApi('/api/dream', { metin })} loading={resultLoading} disabled={!metin.trim()}>
        {t('btn_ruya_analiz')}
      </Button>
      <ResultBox content={result} loading={resultLoading} streaming={streaming} />
    </div>
  );
}
