'use client';

import { useState, useMemo } from 'react';
import { getMoonPhase } from '@/lib/astrology/moon-phase';
import { getAllPlanetPositions } from '@/lib/astrology/ephemeris';
import { matchCrystals, type CrystalMatch } from '@/lib/astrology/crystal-matcher';
import { Button } from '@/components/ui/Button';
import { ResultBox } from '@/components/analysis/ResultBox';
import type { Profile } from '@/types/profile';

interface KristalPanelProps {
  t: (key: string) => string;
  callApi: (endpoint: string, body: Record<string, unknown>) => Promise<void>;
  result: string;
  resultLoading: boolean;
  streaming: boolean;
  profile: Profile;
}

const INTENTIONS = [
  { value: 'genel', labelKey: 'kristal_niyet_genel' },
  { value: 'ask', labelKey: 'kristal_niyet_ask' },
  { value: 'kariyer', labelKey: 'kristal_niyet_kariyer' },
  { value: 'saglik', labelKey: 'kristal_niyet_saglik' },
  { value: 'koruma', labelKey: 'kristal_niyet_koruma' },
  { value: 'ruhsal', labelKey: 'kristal_niyet_ruhsal' },
];

// Map sign names that might come from profile (without diacritics) to crystal-data format
const SIGN_NORMALIZE: Record<string, string> = {
  'Koc': 'Koç', 'Boga': 'Boğa', 'Ikizler': 'İkizler', 'Yengec': 'Yengeç',
  'Aslan': 'Aslan', 'Basak': 'Başak', 'Terazi': 'Terazi', 'Akrep': 'Akrep',
  'Yay': 'Yay', 'Oglak': 'Oğlak', 'Kova': 'Kova', 'Balik': 'Balık',
  'Koç': 'Koç', 'Boğa': 'Boğa', 'İkizler': 'İkizler', 'Yengeç': 'Yengeç',
  'Başak': 'Başak', 'Oğlak': 'Oğlak', 'Balık': 'Balık',
};

function normalizeSign(sign?: string): string | undefined {
  if (!sign) return undefined;
  return SIGN_NORMALIZE[sign] || sign;
}

export function KristalPanel({ t, callApi, result, resultLoading, streaming, profile }: KristalPanelProps) {
  const [intention, setIntention] = useState('genel');
  const [matches, setMatches] = useState<CrystalMatch[] | null>(null);

  const cosmicContext = useMemo(() => {
    const now = new Date();
    const moonPhase = getMoonPhase(now);
    const planets = getAllPlanetPositions(now);
    const retroPlanets = planets.filter((p) => p.retrograde);
    return { moonPhase, retroPlanets, sunSign: normalizeSign(profile.burc) };
  }, [profile.burc]);

  const handleMatch = () => {
    const result = matchCrystals({
      sunSign: normalizeSign(profile.burc),
      risingSign: normalizeSign(profile.yukselen),
      moonSign: normalizeSign(profile['ay-burcu']),
      intention,
      moonPhase: cosmicContext.moonPhase.name,
      hasRetrograde: cosmicContext.retroPlanets.length > 0,
    });
    setMatches(result);
  };

  const handleAIInterpret = () => {
    if (!matches || matches.length === 0) return;
    const crystalSummary = matches.map((m, i) =>
      `${i + 1}. ${m.crystal.nameTr} (skor: ${m.score}) — ${m.reasons.join(', ')}`
    ).join('\n');

    callApi('/api/kristal', { crystalSummary, intention });
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold text-text mb-1">{t('panel_kristal_title')}</h3>
        <p className="text-xs text-muted">{t('panel_kristal_hint')}</p>
      </div>

      {/* Context cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-card/50 border border-border p-3 text-center">
          <span className="text-2xl">{cosmicContext.moonPhase.emoji}</span>
          <p className="text-[10px] text-muted mt-1">{t('ritual_moon_phase')}</p>
          <p className="text-xs font-medium text-text">{cosmicContext.moonPhase.name}</p>
        </div>
        <div className="rounded-xl bg-card/50 border border-border p-3 text-center">
          <span className="text-2xl">♈</span>
          <p className="text-[10px] text-muted mt-1">{t('ozet_burc')}</p>
          <p className="text-xs font-medium text-text">{profile.burc || '—'}</p>
        </div>
        <div className="rounded-xl bg-card/50 border border-border p-3 text-center">
          <span className="text-2xl">{cosmicContext.retroPlanets.length > 0 ? '⚠️' : '✅'}</span>
          <p className="text-[10px] text-muted mt-1">{t('kosm_retro')}</p>
          <p className="text-xs font-medium text-text">
            {cosmicContext.retroPlanets.length > 0
              ? `${cosmicContext.retroPlanets.length} retro`
              : t('kristal_no_retro')}
          </p>
        </div>
      </div>

      {/* Intention selector */}
      <div>
        <label className="block text-xs text-muted mb-1">{t('kristal_niyet_label')}</label>
        <select
          value={intention}
          onChange={(e) => setIntention(e.target.value)}
          className="w-full rounded-xl border border-border bg-card/50 px-3 py-2 text-sm text-text focus:outline-none focus:border-accent"
        >
          {INTENTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{t(opt.labelKey)}</option>
          ))}
        </select>
      </div>

      <Button onClick={handleMatch} loading={false}>
        {t('btn_kristal_match')}
      </Button>

      {/* Crystal results */}
      {matches && matches.length > 0 && (
        <div className="space-y-2">
          {matches.map((m, i) => (
            <div
              key={m.crystal.id}
              className="rounded-xl bg-card/50 border border-border p-3 flex items-start gap-3"
            >
              <div
                className="w-10 h-10 rounded-full shrink-0 border border-white/10"
                style={{ backgroundColor: m.crystal.color }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-text">
                    {i + 1}. {m.crystal.nameTr}
                  </p>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent/20 text-accent">
                    {m.score} puan
                  </span>
                </div>
                <p className="text-xs text-muted mt-0.5">{m.crystal.shortDesc}</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {m.reasons.map((r, ri) => (
                    <span key={ri} className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-muted">
                      {r}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {matches && matches.length > 0 && (
        <>
          <Button onClick={handleAIInterpret} loading={resultLoading}>
            {t('btn_kristal_yorum')}
          </Button>
          <ResultBox content={result} loading={resultLoading} streaming={streaming} />
        </>
      )}
    </div>
  );
}
