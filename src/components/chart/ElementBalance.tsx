'use client';

import { useMemo } from 'react';
import { getAllPlanetPositions } from '@/lib/astrology/ephemeris';
import { ELEMENT_GROUPS } from '@/types/astrology';

const SIGN_NAMES = ['Koç','Boğa','İkizler','Yengeç','Aslan','Başak','Terazi','Akrep','Yay','Oğlak','Kova','Balık'];

const PLANET_NAMES_TR: Record<string, string> = {
  Sun: 'Güneş', Moon: 'Ay', Mercury: 'Merkür', Venus: 'Venüs',
  Mars: 'Mars', Jupiter: 'Jüpiter', Saturn: 'Satürn', Uranus: 'Uranüs',
  Neptune: 'Neptün', Pluto: 'Plüton',
};

interface ElementInfo {
  key: string;
  icon: string;
  color: string;
  bgColor: string;
  planets: string[];
  count: number;
  percentage: number;
}

const ELEMENT_CONFIG: Record<string, { icon: string; color: string; bgColor: string }> = {
  ates: { icon: '🔥', color: 'bg-red-500', bgColor: 'border-red-500/50' },
  toprak: { icon: '🌍', color: 'bg-emerald-500', bgColor: 'border-emerald-500/50' },
  hava: { icon: '💨', color: 'bg-amber-500', bgColor: 'border-amber-500/50' },
  su: { icon: '🌊', color: 'bg-indigo-500', bgColor: 'border-indigo-500/50' },
};

interface ElementBalanceProps {
  birthDate?: string;
  t: (key: string) => string;
}

export function ElementBalance({ birthDate, t }: ElementBalanceProps) {
  const elements = useMemo(() => {
    const date = birthDate ? new Date(birthDate) : new Date();
    if (isNaN(date.getTime())) return null;

    const planets = getAllPlanetPositions(date);
    const elementMap: Record<string, string[]> = { ates: [], toprak: [], hava: [], su: [] };

    for (const planet of planets) {
      const signIdx = Math.floor(planet.longitude / 30) % 12;
      const signName = SIGN_NAMES[signIdx];
      const planetLabel = PLANET_NAMES_TR[planet.name] || planet.name;

      for (const [element, signs] of Object.entries(ELEMENT_GROUPS)) {
        if (signs.includes(signName as typeof signs[number])) {
          elementMap[element].push(planetLabel);
          break;
        }
      }
    }

    const total = planets.length;
    const result: ElementInfo[] = Object.entries(elementMap).map(([key, planetList]) => ({
      key,
      icon: ELEMENT_CONFIG[key].icon,
      color: ELEMENT_CONFIG[key].color,
      bgColor: ELEMENT_CONFIG[key].bgColor,
      planets: planetList,
      count: planetList.length,
      percentage: Math.round((planetList.length / total) * 100),
    }));

    result.sort((a, b) => b.count - a.count);
    return result;
  }, [birthDate]);

  if (!elements) return null;

  const maxCount = Math.max(...elements.map((e) => e.count));

  const ELEMENT_LABELS: Record<string, string> = {
    ates: t('element_ates'),
    toprak: t('element_toprak'),
    hava: t('element_hava'),
    su: t('element_su'),
  };

  return (
    <div className="rounded-2xl border border-border bg-card/50 p-4 space-y-3">
      <h4 className="text-sm font-semibold text-text">{t('element_balance_title')}</h4>

      <div className="space-y-3">
        {elements.map((el) => {
          const isDominant = el.count === maxCount && el.count > 0;
          return (
            <div
              key={el.key}
              className={`rounded-xl border p-3 transition-all ${
                isDominant ? `${el.bgColor} border-2 bg-card/70` : 'border-border/50 bg-card/30'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-lg">{el.icon}</span>
                <span className={`text-sm font-medium ${isDominant ? 'text-text' : 'text-muted'}`}>
                  {ELEMENT_LABELS[el.key]}
                </span>
                {isDominant && (
                  <span className="ml-auto text-[10px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full">
                    {t('element_baskin')}
                  </span>
                )}
                <span className="ml-auto text-xs text-muted">
                  {el.count} {t('element_gezegen_sayisi')} · {el.percentage}%
                </span>
              </div>

              <div className="h-2 rounded-full bg-border overflow-hidden mb-2">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${el.color}`}
                  style={{ width: `${el.percentage}%` }}
                />
              </div>

              {el.planets.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {el.planets.map((planet) => (
                    <span
                      key={planet}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-surface/50 text-muted border border-border/50"
                    >
                      {planet}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
