'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { TextArea } from '@/components/ui/TextArea';
import { ResultBox } from '@/components/analysis/ResultBox';

interface HoraryPanelProps {
  t: (k: string) => string;
  callApi: (e: string, b: Record<string, unknown>) => Promise<void>;
  result: string;
  resultLoading: boolean;
  streaming: boolean;
}

export function HoraryPanel({ t, callApi, result, resultLoading, streaming }: HoraryPanelProps) {
  const [soru, setSoru] = useState('');
  const [konu, setKonu] = useState('');
  const [sure, setSure] = useState('');

  const isValid = soru.trim() && konu && sure;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold text-text mb-1">{t('panel_horar_title')}</h3>
        <p className="text-xs text-muted">{t('panel_horar_hint')}</p>
      </div>
      <div>
        <TextArea label={t('horary_soru_label')} placeholder={t('ph_horary')} value={soru} onChange={(e) => setSoru(e.target.value.slice(0, 200))} rows={2} />
        <p className="text-xs text-muted mt-1">{200 - soru.length} {t('char_kalan')}</p>
      </div>
      <Select label={t('horary_konu_label')} value={konu} onChange={(e) => setKonu(e.target.value)}>
        <option value="">{t('opt_horary_select')}</option>
        <option value="ask">{t('opt_ask')}</option>
        <option value="is">{t('opt_is')}</option>
        <option value="para">{t('opt_para')}</option>
        <option value="aile">{t('opt_aile2')}</option>
        <option value="egitim">{t('opt_egitim')}</option>
        <option value="saglik">{t('opt_saglik')}</option>
        <option value="diger">{t('opt_horar_diger')}</option>
      </Select>
      <Select label={t('horary_zaman_label')} value={sure} onChange={(e) => setSure(e.target.value)}>
        <option value="">{t('opt_horary_select')}</option>
        <option value="24s">{t('opt_24s')}</option>
        <option value="7g">{t('opt_7g')}</option>
        <option value="1ay">{t('opt_1ay')}</option>
        <option value="3ay">{t('opt_3ay')}</option>
        <option value="6ay">{t('opt_6ay')}</option>
      </Select>
      <Button
        onClick={() => callApi('/api/horary', { soru, konu, sure })}
        loading={resultLoading}
        disabled={!isValid}
      >
        {t('btn_horar_analiz')}
      </Button>
      <ResultBox content={result} loading={resultLoading} streaming={streaming} />
    </div>
  );
}
