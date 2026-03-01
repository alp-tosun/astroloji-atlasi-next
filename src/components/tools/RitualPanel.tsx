'use client';

import { useMemo } from 'react';
import { getMoonPhase } from '@/lib/astrology/moon-phase';
import * as Astronomy from 'astronomy-engine';
import { Button } from '@/components/ui/Button';
import { ResultBox } from '@/components/analysis/ResultBox';

interface RitualPanelProps {
  t: (key: string) => string;
  callApi: (endpoint: string, body: Record<string, unknown>) => Promise<void>;
  result: string;
  resultLoading: boolean;
  streaming: boolean;
}

const SIGNS = ['Koç','Boğa','İkizler','Yengeç','Aslan','Başak','Terazi','Akrep','Yay','Oğlak','Kova','Balık'];
const DAY_RULERS: Record<number, string> = {
  0: 'Güneş', 1: 'Ay', 2: 'Mars', 3: 'Merkür', 4: 'Jüpiter', 5: 'Venüs', 6: 'Satürn',
};
const DAY_RULER_ICONS: Record<number, string> = {
  0: '☀️', 1: '🌙', 2: '♂️', 3: '☿️', 4: '♃', 5: '♀️', 6: '♄',
};

function getMoonSign(date: Date): string {
  const moon = Astronomy.EclipticGeoMoon(date);
  const lon = ((moon.lon % 360) + 360) % 360;
  const idx = Math.floor(lon / 30) % 12;
  return SIGNS[idx];
}

export function RitualPanel({ t, callApi, result, resultLoading, streaming }: RitualPanelProps) {
  const cosmicContext = useMemo(() => {
    const now = new Date();
    const phase = getMoonPhase(now);
    const moonSign = getMoonSign(now);
    const dayOfWeek = now.getDay();
    const dayRuler = DAY_RULERS[dayOfWeek];
    const dayRulerIcon = DAY_RULER_ICONS[dayOfWeek];
    return { phase, moonSign, dayRuler, dayRulerIcon };
  }, []);

  const handleGenerate = () => {
    callApi('/api/ritual', {});
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold text-text mb-1">{t('panel_rituel_title')}</h3>
        <p className="text-xs text-muted">{t('panel_rituel_hint')}</p>
      </div>

      {/* Context cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-card/50 border border-border p-3 text-center">
          <span className="text-2xl">{cosmicContext.phase.emoji}</span>
          <p className="text-[10px] text-muted mt-1">{t('ritual_moon_phase')}</p>
          <p className="text-xs font-medium text-text">{cosmicContext.phase.name}</p>
        </div>
        <div className="rounded-xl bg-card/50 border border-border p-3 text-center">
          <span className="text-2xl">{cosmicContext.dayRulerIcon}</span>
          <p className="text-[10px] text-muted mt-1">{t('planetary_day_ruler')}</p>
          <p className="text-xs font-medium text-text">{cosmicContext.dayRuler}</p>
        </div>
        <div className="rounded-xl bg-card/50 border border-border p-3 text-center">
          <span className="text-2xl">🌙</span>
          <p className="text-[10px] text-muted mt-1">{t('lunar_moon_sign')}</p>
          <p className="text-xs font-medium text-text">{cosmicContext.moonSign}</p>
        </div>
      </div>

      <Button onClick={handleGenerate} loading={resultLoading}>
        {t('btn_rituel')}
      </Button>
      <ResultBox content={result} loading={resultLoading} streaming={streaming} />
    </div>
  );
}
