'use client';

import { useState, useEffect } from 'react';
import * as Astronomy from 'astronomy-engine';

interface PlanetInfo {
  name: string;
  icon: string;
  sign: string;
  signIcon: string;
  retrograde: boolean;
}

const SIGNS = ['Koç','Boğa','İkizler','Yengeç','Aslan','Başak','Terazi','Akrep','Yay','Oğlak','Kova','Balık'];
const SIGN_ICONS: Record<string, string> = {
  'Koç': '♈', 'Boğa': '♉', 'İkizler': '♊', 'Yengeç': '♋',
  'Aslan': '♌', 'Başak': '♍', 'Terazi': '♎', 'Akrep': '♏',
  'Yay': '♐', 'Oğlak': '♑', 'Kova': '♒', 'Balık': '♓',
};

function lonToSign(lon: number): string {
  const n = ((lon % 360) + 360) % 360;
  const idx = Math.floor(n / 30) % 12;
  return SIGNS[idx];
}

function getBodyLongitude(body: string, date: Date): number {
  if (body === 'Sun') {
    const sun = Astronomy.SunPosition(date);
    return sun.elon;
  }
  if (body === 'Moon') {
    const moon = Astronomy.EclipticGeoMoon(date);
    return moon.lon;
  }
  const observer = new Astronomy.Observer(0, 0, 0);
  const eq = Astronomy.Equator(body as Astronomy.Body, date, observer, true, true);
  const ecl = Astronomy.Ecliptic(eq.vec);
  return ecl.elon;
}

function isRetrograde(body: string, date: Date): boolean {
  const msPerDay = 86400000;
  const before = new Date(date.getTime() - msPerDay);
  const after = new Date(date.getTime() + msPerDay);
  const lonBefore = getBodyLongitude(body, before);
  const lonAfter = getBodyLongitude(body, after);
  let diff = lonAfter - lonBefore;
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;
  return diff < 0;
}

function computePlanets(date: Date): PlanetInfo[] {
  const bodies = [
    { body: 'Moon', name: 'Ay', icon: '🌙' },
    { body: 'Sun', name: 'Güneş', icon: '☀️' },
    { body: 'Mars', name: 'Mars', icon: '♂️' },
    { body: 'Mercury', name: 'Merkür', icon: '☿' },
  ];

  return bodies.map(({ body, name, icon }) => {
    const lon = getBodyLongitude(body, date);
    const sign = lonToSign(lon);
    const retrograde = body !== 'Sun' && body !== 'Moon' ? isRetrograde(body, date) : false;
    return {
      name,
      icon,
      sign,
      signIcon: SIGN_ICONS[sign] || '',
      retrograde,
    };
  });
}

export function LivePlanetBand() {
  const [planets, setPlanets] = useState<PlanetInfo[] | null>(null);
  const [dateStr, setDateStr] = useState('');

  useEffect(() => {
    const now = new Date();
    setDateStr(now.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }));
    try {
      const result = computePlanets(now);
      setPlanets(result);
    } catch {
      // Fallback: no data
    }
  }, []);

  if (!planets) return null;

  const mercury = planets.find((p) => p.name === 'Merkür');

  return (
    <div data-tour="planet-band" className="sticky top-0 z-50 border-b border-border/40 bg-bg/90 backdrop-blur-xl">
      <div className="mx-auto max-w-5xl px-4">
        <div className="flex items-center gap-1 overflow-x-auto py-2 scrollbar-hide">
          {/* Date */}
          <span className="shrink-0 text-xs text-muted mr-2">
            📅 {dateStr}
          </span>

          <span className="shrink-0 w-px h-4 bg-border/60" />

          {/* Planets */}
          {planets.map((p) => (
            <div
              key={p.name}
              className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs"
            >
              <span>{p.icon}</span>
              <span className="text-muted">{p.name}</span>
              <span className="font-medium text-text">{p.signIcon} {p.sign}</span>
              {p.retrograde && (
                <span className="text-[10px] text-red-400 font-semibold ml-0.5">℞</span>
              )}
            </div>
          ))}

          <span className="shrink-0 w-px h-4 bg-border/60" />

          {/* Mercury Status */}
          {mercury && (
            <div className={`shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
              mercury.retrograde
                ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                : 'bg-green-500/10 text-green-400 border border-green-500/20'
            }`}>
              <span>{mercury.retrograde ? '↩️' : '▶️'}</span>
              <span>{mercury.retrograde ? 'Merkür Retro' : 'Merkür Düz'}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
