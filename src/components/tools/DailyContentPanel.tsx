'use client';

import { Button } from '@/components/ui/Button';
import { ResultBox } from '@/components/analysis/ResultBox';

interface DailyContentPanelProps {
  t: (k: string) => string;
  callApi: (e: string, b: Record<string, unknown>) => Promise<void>;
  result: string;
  resultLoading: boolean;
  streaming: boolean;
  type: 'gunun-karti' | 'haftalik' | 'aylik';
  profile: Record<string, string | undefined>;
}

export function DailyContentPanel({ t, callApi, result, resultLoading, streaming, type, profile }: DailyContentPanelProps) {
  const titleKey = `panel_${type.replace('-', '_')}_title`;
  const hintKey = `panel_${type.replace('-', '_')}_hint`;
  const btnKey = `btn_${type.replace('-', '_')}`;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold text-text mb-1">{t(titleKey)}</h3>
        <p className="text-xs text-muted">{t(hintKey)}</p>
      </div>
      <Button
        onClick={() => callApi('/api/daily-content', { type, burc: profile.burc || '' })}
        loading={resultLoading}
      >
        {t(btnKey)}
      </Button>
      <ResultBox content={result} loading={resultLoading} streaming={streaming} />
    </div>
  );
}
