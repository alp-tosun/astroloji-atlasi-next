'use client';

import { useState, useMemo } from 'react';
import { getMoonPhase } from '@/lib/astrology/moon-phase';
import * as Astronomy from 'astronomy-engine';
import { Button } from '@/components/ui/Button';
import { ResultBox } from '@/components/analysis/ResultBox';

interface LunarCalendarPanelProps {
  t: (key: string) => string;
  callApi: (endpoint: string, body: Record<string, unknown>) => Promise<void>;
  result: string;
  resultLoading: boolean;
  streaming: boolean;
}

interface LunarDay {
  date: Date;
  dateStr: string;
  dayNum: number;
  isToday: boolean;
  phase: string;
  emoji: string;
  illumination: number;
  moonSign: string;
  isSpecial: boolean;
  specialType: 'full' | 'new' | 'quarter' | null;
}

const SIGNS = ['Koç','Boğa','İkizler','Yengeç','Aslan','Başak','Terazi','Akrep','Yay','Oğlak','Kova','Balık'];

const SIGN_ICONS: Record<string, string> = {
  'Koç': '♈', 'Boğa': '♉', 'İkizler': '♊', 'Yengeç': '♋',
  'Aslan': '♌', 'Başak': '♍', 'Terazi': '♎', 'Akrep': '♏',
  'Yay': '♐', 'Oğlak': '♑', 'Kova': '♒', 'Balık': '♓',
};

function getMoonSign(date: Date): string {
  const moon = Astronomy.EclipticGeoMoon(date);
  const lon = ((moon.lon % 360) + 360) % 360;
  const idx = Math.floor(lon / 30) % 12;
  return SIGNS[idx];
}

function computeLunarCalendar(): LunarDay[] {
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const days: LunarDay[] = [];

  for (let i = 0; i < 30; i++) {
    const date = new Date(now);
    date.setDate(now.getDate() + i);
    date.setHours(12, 0, 0, 0);
    const dateStr = date.toISOString().slice(0, 10);

    const phaseInfo = getMoonPhase(date);
    const moonSign = getMoonSign(date);

    const isNewMoon = phaseInfo.name === 'Yeni Ay';
    const isFullMoon = phaseInfo.name === 'Dolunay';
    const isQuarter = phaseInfo.name === 'İlk Dördün' || phaseInfo.name === 'Son Dördün';
    const isSpecial = isNewMoon || isFullMoon || isQuarter;

    days.push({
      date,
      dateStr,
      dayNum: date.getDate(),
      isToday: dateStr === today,
      phase: phaseInfo.name,
      emoji: phaseInfo.emoji,
      illumination: phaseInfo.illumination,
      moonSign,
      isSpecial,
      specialType: isFullMoon ? 'full' : isNewMoon ? 'new' : isQuarter ? 'quarter' : null,
    });
  }

  return days;
}

export function LunarCalendarPanel({ t, callApi, result, resultLoading, streaming }: LunarCalendarPanelProps) {
  const [selectedDay, setSelectedDay] = useState<LunarDay | null>(null);

  const today = new Date().toDateString();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const calendar = useMemo(() => computeLunarCalendar(), [today]);

  const handleAiInterpret = (day: LunarDay) => {
    callApi('/api/lunar', {
      date: day.date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }),
      phase: day.phase,
      moonSign: day.moonSign,
      illumination: day.illumination,
    });
  };

  const firstDow = calendar[0]?.date.getDay() || 0;

  const PHASE_RITUAL_KEYS: Record<string, string> = {
    'Yeni Ay': 'lunar_ritual_new',
    'Hilal (Büyüyen)': 'lunar_ritual_waxing_crescent',
    'İlk Dördün': 'lunar_ritual_first_quarter',
    'Şişkin Ay (Büyüyen)': 'lunar_ritual_waxing_gibbous',
    'Dolunay': 'lunar_ritual_full',
    'Şişkin Ay (Küçülen)': 'lunar_ritual_waning_gibbous',
    'Son Dördün': 'lunar_ritual_last_quarter',
    'Hilal (Küçülen)': 'lunar_ritual_waning_crescent',
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold text-text mb-1">{t('panel_ay_takvimi_title')}</h3>
        <p className="text-xs text-muted">{t('panel_ay_takvimi_hint')}</p>
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
              onClick={() => setSelectedDay(day)}
              className={`relative flex flex-col items-center justify-center rounded-lg p-1.5 min-h-[44px] text-xs transition-all cursor-pointer ${
                selectedDay?.dateStr === day.dateStr
                  ? 'bg-accent/20 border border-accent/40 text-accent'
                  : day.isToday
                    ? 'bg-accent/10 border border-accent/20 text-text'
                    : day.specialType === 'full'
                      ? 'bg-yellow-500/10 border border-yellow-500/30 text-text hover:border-yellow-500/50'
                      : day.specialType === 'new'
                        ? 'bg-purple-500/10 border border-purple-500/30 text-text hover:border-purple-500/50'
                        : 'bg-card/80 border border-border hover:border-accent/30 text-text'
              }`}
            >
              <span className="text-sm leading-none">{day.emoji}</span>
              <span className={`font-medium text-[10px] mt-0.5 ${day.isToday ? 'text-accent' : ''}`}>{day.dayNum}</span>
            </button>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border/40">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-yellow-500" />
            <span className="text-[10px] text-muted">{t('lunar_phase_full')}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-purple-500" />
            <span className="text-[10px] text-muted">{t('lunar_phase_new')}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            <span className="text-[10px] text-muted">{t('lunar_phase_quarter')}</span>
          </div>
        </div>
      </div>

      {/* Selected day detail */}
      {selectedDay && (
        <div className="rounded-xl bg-card/50 border border-border p-4 space-y-3">
          <h4 className="text-sm font-medium text-text">
            {selectedDay.date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', weekday: 'long' })}
          </h4>

          <div className="grid grid-cols-2 gap-3">
            {/* Phase */}
            <div className="rounded-lg bg-surface/50 p-2.5 text-center">
              <span className="text-2xl">{selectedDay.emoji}</span>
              <p className="text-xs font-medium text-text mt-1">{selectedDay.phase}</p>
            </div>
            {/* Moon Sign */}
            <div className="rounded-lg bg-surface/50 p-2.5 text-center">
              <span className="text-2xl">{SIGN_ICONS[selectedDay.moonSign] || ''}</span>
              <p className="text-xs font-medium text-text mt-1">{t('lunar_moon_sign')}: {selectedDay.moonSign}</p>
            </div>
          </div>

          {/* Illumination bar */}
          <div>
            <div className="flex justify-between text-xs text-muted mb-1">
              <span>{t('lunar_illumination')}</span>
              <span>%{selectedDay.illumination}</span>
            </div>
            <div className="w-full h-2 bg-border rounded-full overflow-hidden">
              <div
                className="h-full bg-yellow-400 rounded-full transition-all"
                style={{ width: `${selectedDay.illumination}%` }}
              />
            </div>
          </div>

          {/* Static ritual text */}
          <div className="rounded-lg bg-accent/5 border border-accent/10 p-3">
            <p className="text-xs text-muted leading-relaxed">
              {t(PHASE_RITUAL_KEYS[selectedDay.phase] || 'lunar_ritual_new')}
            </p>
          </div>

          {/* AI button */}
          {!result && !resultLoading && (
            <Button onClick={() => handleAiInterpret(selectedDay)} loading={resultLoading}>
              {t('btn_ay_takvimi_ai')}
            </Button>
          )}
        </div>
      )}

      {/* AI interpretation */}
      {selectedDay && (
        <ResultBox content={result} loading={resultLoading} streaming={streaming} />
      )}
    </div>
  );
}
