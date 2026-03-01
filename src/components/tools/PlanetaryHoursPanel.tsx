'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import * as Astronomy from 'astronomy-engine';
import { calculatePlanetaryHours } from '@/lib/astrology/planetary-hours';
import { TURKISH_CITIES } from '@/lib/astrology/geocoding';
import { Button } from '@/components/ui/Button';
import { ResultBox } from '@/components/analysis/ResultBox';

interface PlanetaryHoursPanelProps {
  t: (key: string) => string;
  callApi?: (endpoint: string, body: Record<string, unknown>) => Promise<void>;
  result?: string;
  resultLoading?: boolean;
  streaming?: boolean;
  birthPlace?: string;
}

const PLANET_TR: Record<string, string> = {
  Sun: 'Güneş', Moon: 'Ay', Mars: 'Mars', Mercury: 'Merkür',
  Jupiter: 'Jüpiter', Venus: 'Venüs', Saturn: 'Satürn',
};

const PLANET_ICONS: Record<string, string> = {
  Sun: '☀️', Moon: '🌙', Mars: '♂️', Mercury: '☿️',
  Jupiter: '♃', Venus: '♀️', Saturn: '♄',
};

const PLANET_ACTIVITY_KEYS: Record<string, string> = {
  Sun: 'planetary_activity_sun',
  Moon: 'planetary_activity_moon',
  Mars: 'planetary_activity_mars',
  Mercury: 'planetary_activity_mercury',
  Jupiter: 'planetary_activity_jupiter',
  Venus: 'planetary_activity_venus',
  Saturn: 'planetary_activity_saturn',
};

function formatTime(date: Date): string {
  return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
}

function formatCountdown(ms: number): string {
  if (ms <= 0) return '00:00';
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

export function PlanetaryHoursPanel({ t, callApi, result, resultLoading, streaming, birthPlace }: PlanetaryHoursPanelProps) {
  // B5: resolve observer from profile birth place
  const observer = useMemo(() => {
    if (birthPlace) {
      const normalized = birthPlace.toLowerCase().trim();
      const city = TURKISH_CITIES[normalized];
      if (city) return new Astronomy.Observer(city.lat, city.lng, 0);
    }
    return undefined; // fallback to Istanbul default inside calculatePlanetaryHours
  }, [birthPlace]);

  // B9: stale fix — recalculate when day changes
  const today = new Date().toDateString();
  const [hoursData, setHoursData] = useState(() => calculatePlanetaryHours(undefined, observer));
  const [countdown, setCountdown] = useState('');
  const [currentIdx, setCurrentIdx] = useState(hoursData.currentHourIndex);

  useEffect(() => {
    setHoursData(calculatePlanetaryHours(undefined, observer));
  }, [today, observer]);

  const updateCountdown = useCallback(() => {
    const now = new Date();
    const current = hoursData.hours.find((h) => now >= h.start && now < h.end);
    if (current) {
      setCurrentIdx(current.index);
      setCountdown(formatCountdown(current.end.getTime() - now.getTime()));
    }
  }, [hoursData.hours]);

  useEffect(() => {
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [updateCountdown]);

  const currentHour = hoursData.hours[currentIdx];
  const dayRulerName = PLANET_TR[hoursData.dayRuler] || hoursData.dayRuler;

  // B14: AI interpretation
  const handleAiInterpret = () => {
    if (!callApi || !currentHour) return;
    const planetName = PLANET_TR[currentHour.planet] || currentHour.planet;
    callApi('/api/cosmic', {
      tarih: new Date().toLocaleDateString('tr-TR'),
      gun: new Date().toLocaleDateString('tr-TR', { weekday: 'long' }),
      web_data: `Gezegen Saati: Şu an ${planetName} saati aktif (${formatTime(currentHour.start)} - ${formatTime(currentHour.end)}). Günün yöneticisi: ${dayRulerName}.`,
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold text-text mb-1">{t('panel_gezegen_saatleri_title')}</h3>
        <p className="text-xs text-muted">{t('panel_gezegen_saatleri_hint')}</p>
      </div>

      {/* Day ruler card */}
      <div className="rounded-xl bg-card/50 border border-border p-4 text-center">
        <p className="text-xs text-muted mb-1">{t('planetary_day_ruler')}</p>
        <span className="text-3xl">{PLANET_ICONS[hoursData.dayRuler] || ''}</span>
        <p className="text-sm font-semibold text-text mt-1">{dayRulerName}</p>
      </div>

      {/* Current hour card */}
      {currentHour && (
        <div className="rounded-xl bg-accent/10 border border-accent/30 p-4 text-center space-y-2">
          <p className="text-xs text-muted">{t('planetary_current_hour')}</p>
          <div className="text-4xl animate-pulse">
            {PLANET_ICONS[currentHour.planet] || ''}
          </div>
          <p className="text-lg font-bold text-text">
            {PLANET_TR[currentHour.planet] || currentHour.planet}
          </p>
          <div className="text-2xl font-mono font-bold text-accent">{countdown}</div>
          <p className="text-xs text-muted">{t('planetary_remaining')}</p>
          <div className="rounded-lg bg-surface/50 p-2 mt-2">
            <p className="text-xs text-muted">{t(PLANET_ACTIVITY_KEYS[currentHour.planet] || 'planetary_activity_sun')}</p>
          </div>
        </div>
      )}

      {/* B14: AI interpret button */}
      {callApi && (
        <Button onClick={handleAiInterpret} loading={resultLoading}>
          {t('btn_gezegen_saat_yorumla') !== 'btn_gezegen_saat_yorumla' ? t('btn_gezegen_saat_yorumla') : 'Bu Saati Yorumla'}
        </Button>
      )}
      {result !== undefined && <ResultBox content={result} loading={resultLoading || false} streaming={streaming || false} />}

      {/* Sunrise/Sunset bar */}
      <div className="flex justify-between rounded-xl bg-card/50 border border-border p-3">
        <div className="text-center flex-1">
          <p className="text-xs text-muted">{t('planetary_sunrise')}</p>
          <p className="text-sm font-medium text-text">☀️ {formatTime(hoursData.sunrise)}</p>
        </div>
        <div className="w-px bg-border" />
        <div className="text-center flex-1">
          <p className="text-xs text-muted">{t('planetary_sunset')}</p>
          <p className="text-sm font-medium text-text">🌅 {formatTime(hoursData.sunset)}</p>
        </div>
      </div>

      {/* Hours timeline */}
      <div className="rounded-xl bg-card/50 border border-border p-3 space-y-1">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-semibold text-text">{t('planetary_day_hours')}</span>
        </div>
        {hoursData.hours.slice(0, 12).map((hour) => {
          const isPast = new Date() > hour.end;
          const isCurrent = hour.index === currentIdx;
          return (
            <div
              key={hour.index}
              className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs transition-all ${
                isCurrent
                  ? 'bg-accent/15 border border-accent/30 text-accent font-medium'
                  : isPast
                    ? 'text-muted/50'
                    : 'text-text'
              }`}
            >
              <span className="w-5 text-center">{PLANET_ICONS[hour.planet] || ''}</span>
              <span className="flex-1">{PLANET_TR[hour.planet] || hour.planet}</span>
              <span className="font-mono text-[10px]">{formatTime(hour.start)} - {formatTime(hour.end)}</span>
            </div>
          );
        })}

        <div className="flex items-center gap-2 mt-3 mb-2">
          <span className="text-xs font-semibold text-text">{t('planetary_night_hours')}</span>
        </div>
        {hoursData.hours.slice(12).map((hour) => {
          const isPast = new Date() > hour.end;
          const isCurrent = hour.index === currentIdx;
          return (
            <div
              key={hour.index}
              className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs transition-all ${
                isCurrent
                  ? 'bg-accent/15 border border-accent/30 text-accent font-medium'
                  : isPast
                    ? 'text-muted/50'
                    : 'text-text'
              }`}
            >
              <span className="w-5 text-center">{PLANET_ICONS[hour.planet] || ''}</span>
              <span className="flex-1">{PLANET_TR[hour.planet] || hour.planet}</span>
              <span className="font-mono text-[10px]">{formatTime(hour.start)} - {formatTime(hour.end)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
