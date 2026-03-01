'use client';

import { useMemo } from 'react';
import { getTransits, type TransitInfo } from '@/lib/astrology/transits';
import { getMoonPhase } from '@/lib/astrology/moon-phase';
import { ASPECT_NAMES_TR, type AspectType } from '@/lib/astrology/aspects';
import { Button } from '@/components/ui/Button';
import { ResultBox } from '@/components/analysis/ResultBox';
import type { Profile } from '@/types/profile';

interface TransitKisiselPanelProps {
  t: (key: string) => string;
  callApi: (endpoint: string, body: Record<string, unknown>) => Promise<void>;
  result: string;
  resultLoading: boolean;
  streaming: boolean;
  profile: Profile;
}

const PLANET_TR: Record<string, string> = {
  Sun: 'Güneş', Moon: 'Ay', Mercury: 'Merkür', Venus: 'Venüs',
  Mars: 'Mars', Jupiter: 'Jüpiter', Saturn: 'Satürn',
  Uranus: 'Uranüs', Neptune: 'Neptün', Pluto: 'Plüton',
};

const ASPECT_COLORS: Record<AspectType, { bg: string; border: string; label: string }> = {
  conjunction: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', label: 'text-blue-400' },
  trine: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', label: 'text-emerald-400' },
  sextile: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', label: 'text-emerald-400' },
  square: { bg: 'bg-red-500/10', border: 'border-red-500/30', label: 'text-red-400' },
  opposition: { bg: 'bg-red-500/10', border: 'border-red-500/30', label: 'text-red-400' },
};

const ASPECT_EMOJI: Record<AspectType, string> = {
  conjunction: '\u260C',
  trine: '\u25B3',
  sextile: '\u2731',
  square: '\u25A1',
  opposition: '\u260D',
};

export function TransitKisiselPanel({ t, callApi, result, resultLoading, streaming, profile }: TransitKisiselPanelProps) {
  const birthDateStr = profile['dogum-tarih'];

  const transitData = useMemo(() => {
    if (!birthDateStr) return null;
    const birthDate = new Date(birthDateStr);
    if (isNaN(birthDate.getTime())) return null;

    const birthTimeStr = profile['dogum-saat'];
    if (birthTimeStr) {
      const timeMatch = birthTimeStr.match(/(\d{1,2}):(\d{2})/);
      if (timeMatch) {
        birthDate.setHours(parseInt(timeMatch[1]), parseInt(timeMatch[2]), 0, 0);
      }
    }

    const now = new Date();
    const transits = getTransits(birthDate, now);
    const moonPhase = getMoonPhase(now);
    return { transits: transits.slice(0, 12), moonPhase };
  }, [birthDateStr, profile]);

  if (!birthDateStr) {
    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-base font-semibold text-text mb-1">{t('panel_transit_kisisel_title')}</h3>
          <p className="text-xs text-muted">{t('panel_transit_kisisel_hint')}</p>
        </div>
        <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-4 text-center">
          <p className="text-sm text-amber-300">{t('transit_kisisel_no_birth')}</p>
        </div>
      </div>
    );
  }

  const handleAnalyze = () => {
    if (!transitData) return;
    const transitSummary = transitData.transits.map((tr: TransitInfo) => {
      const tp = PLANET_TR[tr.transitPlanet.name] || tr.transitPlanet.name;
      const np = PLANET_TR[tr.natalPlanet.name] || tr.natalPlanet.name;
      const aspectTr = ASPECT_NAMES_TR[tr.aspect.type] || tr.aspect.type;
      const dir = tr.aspect.applying ? 'yaklaşan' : 'ayrılan';
      return `Transit ${tp} ${aspectTr} Natal ${np} (${tr.aspect.orb.toFixed(1)}° orb, ${dir})`;
    }).join('\n');

    callApi('/api/transit-kisisel', { transitSummary });
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold text-text mb-1">{t('panel_transit_kisisel_title')}</h3>
        <p className="text-xs text-muted">{t('panel_transit_kisisel_hint')}</p>
      </div>

      {transitData && transitData.transits.length > 0 ? (
        <div className="space-y-2">
          {transitData.transits.map((tr: TransitInfo, i: number) => {
            const colors = ASPECT_COLORS[tr.aspect.type];
            const emoji = ASPECT_EMOJI[tr.aspect.type];
            const tp = PLANET_TR[tr.transitPlanet.name] || tr.transitPlanet.name;
            const np = PLANET_TR[tr.natalPlanet.name] || tr.natalPlanet.name;
            const aspectName = ASPECT_NAMES_TR[tr.aspect.type];

            return (
              <div key={i} className={`rounded-xl ${colors.bg} border ${colors.border} p-3`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`text-lg font-bold ${colors.label}`}>{emoji}</span>
                    <div>
                      <p className="text-sm font-medium text-text">
                        {tp} {aspectName} {np}
                      </p>
                      <p className="text-[10px] text-muted">
                        {tr.aspect.orb.toFixed(1)}° orb
                      </p>
                    </div>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                    tr.aspect.applying
                      ? 'bg-amber-500/20 text-amber-300'
                      : 'bg-zinc-500/20 text-zinc-400'
                  }`}>
                    {tr.aspect.applying ? t('transit_kisisel_applying') : t('transit_kisisel_separating')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl bg-card/50 border border-border p-4 text-center">
          <p className="text-xs text-muted">{t('transit_kisisel_no_aspects')}</p>
        </div>
      )}

      <Button onClick={handleAnalyze} loading={resultLoading} disabled={!transitData || transitData.transits.length === 0}>
        {t('btn_transit_kisisel')}
      </Button>
      <ResultBox content={result} loading={resultLoading} streaming={streaming} />
    </div>
  );
}
