'use client';

import { useState, useMemo } from 'react';
import { getAllPlanetPositions, type PlanetPosition } from '@/lib/astrology/ephemeris';
import { Button } from '@/components/ui/Button';
import { ResultBox } from '@/components/analysis/ResultBox';

interface TransitCalendarPanelProps {
  t: (key: string) => string;
  callApi: (endpoint: string, body: Record<string, unknown>) => Promise<void>;
  result: string;
  resultLoading: boolean;
  streaming: boolean;
  birthDate?: string;
}

interface DayTransit {
  date: Date;
  dateStr: string;
  dayNum: number;
  isToday: boolean;
  signChanges: SignChange[];
  retroChanges: RetroChange[];
}

interface SignChange {
  planet: string;
  fromSign: string;
  toSign: string;
}

interface RetroChange {
  planet: string;
  type: 'enters-retro' | 'goes-direct';
}

const PLANET_TR: Record<string, string> = {
  Sun: 'Güneş', Moon: 'Ay', Mercury: 'Merkür', Venus: 'Venüs',
  Mars: 'Mars', Jupiter: 'Jüpiter', Saturn: 'Satürn',
  Uranus: 'Uranüs', Neptune: 'Neptün', Pluto: 'Plüton',
};

const SIGN_ICONS: Record<string, string> = {
  'Koc': '\u2648', 'Boga': '\u2649', 'Ikizler': '\u264A', 'Yengec': '\u264B',
  'Aslan': '\u264C', 'Basak': '\u264D', 'Terazi': '\u264E', 'Akrep': '\u264F',
  'Yay': '\u2650', 'Oglak': '\u2651', 'Kova': '\u2652', 'Balik': '\u2653',
};

function computeTransitCalendar(): DayTransit[] {
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const days: DayTransit[] = [];

  let prevPositions: PlanetPosition[] | null = null;

  for (let i = 0; i < 30; i++) {
    const date = new Date(now);
    date.setDate(now.getDate() + i);
    date.setHours(12, 0, 0, 0);
    const dateStr = date.toISOString().slice(0, 10);

    let positions: PlanetPosition[];
    try {
      positions = getAllPlanetPositions(date);
    } catch {
      days.push({ date, dateStr, dayNum: date.getDate(), isToday: dateStr === today, signChanges: [], retroChanges: [] });
      continue;
    }

    const signChanges: SignChange[] = [];
    const retroChanges: RetroChange[] = [];

    if (prevPositions) {
      for (const pos of positions) {
        const prev = prevPositions.find((p) => p.name === pos.name);
        if (!prev) continue;
        // Skip Moon — changes sign too often
        if (pos.name === 'Moon') continue;

        if (prev.sign !== pos.sign) {
          signChanges.push({
            planet: pos.name,
            fromSign: prev.sign,
            toSign: pos.sign,
          });
        }
        if (prev.retrograde !== pos.retrograde) {
          retroChanges.push({
            planet: pos.name,
            type: pos.retrograde ? 'enters-retro' : 'goes-direct',
          });
        }
      }
    }

    days.push({ date, dateStr, dayNum: date.getDate(), isToday: dateStr === today, signChanges, retroChanges });
    prevPositions = positions;
  }

  return days;
}

export function TransitCalendarPanel({ t, callApi, result, resultLoading, streaming, birthDate }: TransitCalendarPanelProps) {
  const [selectedDay, setSelectedDay] = useState<DayTransit | null>(null);

  const today = new Date().toDateString();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const calendar = useMemo(() => computeTransitCalendar(), [today]);

  const handleDayClick = (day: DayTransit) => {
    setSelectedDay(day);
    const events: string[] = [];
    for (const sc of day.signChanges) {
      events.push(`${PLANET_TR[sc.planet] || sc.planet} ${sc.fromSign}'dan ${sc.toSign}'a gecti`);
    }
    for (const rc of day.retroChanges) {
      events.push(`${PLANET_TR[rc.planet] || rc.planet} ${rc.type === 'enters-retro' ? 'retroya girdi' : 'duz seyre gecti'}`);
    }

    const eventText = events.length > 0
      ? events.join('; ')
      : 'Onemli gecis yok';

    const dateStr = day.date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });

    callApi('/api/cosmic', {
      tarih: dateStr,
      gun: day.date.toLocaleDateString('tr-TR', { weekday: 'long' }),
      web_data: `Transit olaylari: ${eventText}. ${birthDate ? `Kullanicinin dogum tarihi: ${birthDate}` : ''}`,
    });
  };

  const hasEvents = (day: DayTransit) => day.signChanges.length > 0 || day.retroChanges.length > 0;

  // Group by weeks for grid display
  const firstDow = calendar[0]?.date.getDay() || 0;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold text-text mb-1">{t('panel_transit_title')}</h3>
        <p className="text-xs text-muted">{t('panel_transit_hint')}</p>
      </div>

      {/* Calendar grid */}
      <div className="rounded-xl bg-card/50 border border-border p-3">
        {/* Day labels */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {[t('transit_mon'), t('transit_tue'), t('transit_wed'), t('transit_thu'), t('transit_fri'), t('transit_sat'), t('transit_sun')].map((d) => (
            <div key={d} className="text-center text-[10px] text-muted font-medium">{d}</div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-1">
          {/* Empty cells for offset */}
          {Array.from({ length: (firstDow + 6) % 7 }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}

          {calendar.map((day) => (
            <button
              key={day.dateStr}
              onClick={() => hasEvents(day) ? handleDayClick(day) : undefined}
              className={`relative flex flex-col items-center justify-center rounded-lg p-1.5 min-h-[44px] text-xs transition-all ${
                selectedDay?.dateStr === day.dateStr
                  ? 'bg-accent/20 border border-accent/40 text-accent'
                  : day.isToday
                    ? 'bg-accent/10 border border-accent/20 text-text'
                    : hasEvents(day)
                      ? 'bg-card/80 border border-border hover:border-accent/30 text-text cursor-pointer'
                      : 'text-muted'
              }`}
            >
              <span className={`font-medium ${day.isToday ? 'text-accent' : ''}`}>{day.dayNum}</span>
              {hasEvents(day) && (
                <div className="flex gap-0.5 mt-0.5">
                  {day.signChanges.length > 0 && (
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                  )}
                  {day.retroChanges.length > 0 && (
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                  )}
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border/40">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            <span className="text-[10px] text-muted">{t('transit_sign_change')}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-400" />
            <span className="text-[10px] text-muted">{t('transit_retro_change')}</span>
          </div>
        </div>
      </div>

      {/* Selected day detail */}
      {selectedDay && hasEvents(selectedDay) && (
        <div className="rounded-xl bg-card/50 border border-border p-3 space-y-2">
          <h4 className="text-sm font-medium text-text">
            {selectedDay.date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', weekday: 'long' })}
          </h4>
          <div className="space-y-1.5">
            {selectedDay.signChanges.map((sc, i) => (
              <div key={`sc-${i}`} className="flex items-center gap-2 text-xs">
                <span className="text-blue-400">{SIGN_ICONS[sc.toSign] || ''}</span>
                <span className="text-text">
                  {PLANET_TR[sc.planet] || sc.planet}: {sc.fromSign} → {sc.toSign}
                </span>
              </div>
            ))}
            {selectedDay.retroChanges.map((rc, i) => (
              <div key={`rc-${i}`} className="flex items-center gap-2 text-xs">
                <span className="text-red-400">{rc.type === 'enters-retro' ? '\u21A9\uFE0F' : '\u25B6\uFE0F'}</span>
                <span className="text-text">
                  {PLANET_TR[rc.planet] || rc.planet}: {rc.type === 'enters-retro' ? t('transit_retro_start') : t('transit_direct_start')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI interpretation */}
      {selectedDay && (
        <div>
          {!result && !resultLoading && (
            <Button onClick={() => handleDayClick(selectedDay)} loading={resultLoading}>
              {t('btn_transit_analiz')}
            </Button>
          )}
          <ResultBox content={result} loading={resultLoading} streaming={streaming} />
        </div>
      )}
    </div>
  );
}
