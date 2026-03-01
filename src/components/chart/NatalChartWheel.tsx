'use client';

import { useState, useMemo } from 'react';
import { getAllPlanetPositions, type PlanetPosition } from '@/lib/astrology/ephemeris';

// ─── Constants ───
const SIZE = 380;
const CX = SIZE / 2;
const CY = SIZE / 2;
const R_OUTER = 170;
const R_SIGN_MID = 152;
const R_INNER = 134;
const R_PLANET = 110;
const R_ASPECT = 80;

const SIGN_SYMBOLS = ['\u2648','\u2649','\u264A','\u264B','\u264C','\u264D','\u264E','\u264F','\u2650','\u2651','\u2652','\u2653'];
const SIGN_NAMES = ['Ko\u00e7','Bo\u011fa','\u0130kizler','Yenge\u00e7','Aslan','Ba\u015fak','Terazi','Akrep','Yay','O\u011flak','Kova','Bal\u0131k'];
const SIGN_COLORS = [
  '#ef4444','#10b981','#f59e0b','#6366f1','#ef4444','#10b981',
  '#f59e0b','#6366f1','#ef4444','#10b981','#f59e0b','#6366f1',
];

const PLANET_SYMBOLS: Record<string, string> = {
  Sun: '\u2609', Moon: '\u263D', Mercury: '\u263F', Venus: '\u2640',
  Mars: '\u2642', Jupiter: '\u2643', Saturn: '\u2644', Uranus: '\u2645',
  Neptune: '\u2646', Pluto: '\u2647',
};

const PLANET_COLORS: Record<string, string> = {
  Sun: '#f59e0b', Moon: '#c4b5fd', Mercury: '#6ee7b7', Venus: '#f9a8d4',
  Mars: '#ef4444', Jupiter: '#60a5fa', Saturn: '#a78bfa', Uranus: '#34d399',
  Neptune: '#818cf8', Pluto: '#9ca3af',
};

const PLANET_NAMES_TR: Record<string, string> = {
  Sun: 'G\u00fcne\u015f', Moon: 'Ay', Mercury: 'Merk\u00fcr', Venus: 'Ven\u00fcs',
  Mars: 'Mars', Jupiter: 'J\u00fcpiter', Saturn: 'Sat\u00fcrn', Uranus: '\u00dcran\u00fcs',
  Neptune: 'Nept\u00fcn', Pluto: 'Pl\u00fcton',
};

// ─── Aspect definitions ───
interface AspectDef { name: string; angle: number; orb: number; color: string; dash?: string; }
const ASPECTS: AspectDef[] = [
  { name: 'Kavu\u015fum', angle: 0, orb: 8, color: '#f59e0b' },
  { name: 'Kar\u015f\u0131t', angle: 180, orb: 8, color: '#ef4444', dash: '6,3' },
  { name: '\u00dcgen', angle: 120, orb: 8, color: '#10b981' },
  { name: 'Kare', angle: 90, orb: 7, color: '#ef4444', dash: '4,4' },
  { name: 'Altigen', angle: 60, orb: 6, color: '#60a5fa', dash: '2,4' },
];

// ─── Helpers ───
function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function angleDiff(a: number, b: number) {
  let d = Math.abs(a - b) % 360;
  if (d > 180) d = 360 - d;
  return d;
}

function findAspects(planets: PlanetPosition[]) {
  const result: { p1: PlanetPosition; p2: PlanetPosition; aspect: AspectDef }[] = [];
  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const diff = angleDiff(planets[i].longitude, planets[j].longitude);
      for (const asp of ASPECTS) {
        if (Math.abs(diff - asp.angle) <= asp.orb) {
          result.push({ p1: planets[i], p2: planets[j], aspect: asp });
          break;
        }
      }
    }
  }
  return result;
}

// Spread planets so they don't overlap visually
function spreadPlanets(planets: PlanetPosition[], minGap: number = 8) {
  const sorted = planets.map((p) => ({ ...p, displayLon: p.longitude }));
  sorted.sort((a, b) => a.longitude - b.longitude);
  for (let pass = 0; pass < 5; pass++) {
    for (let i = 0; i < sorted.length; i++) {
      const next = sorted[(i + 1) % sorted.length];
      let diff = next.displayLon - sorted[i].displayLon;
      if (diff < 0) diff += 360;
      if (diff < minGap) {
        sorted[i].displayLon = (sorted[i].displayLon - (minGap - diff) / 2 + 360) % 360;
        next.displayLon = (next.displayLon + (minGap - diff) / 2) % 360;
      }
    }
  }
  return sorted;
}

// ─── Component ───
interface NatalChartWheelProps {
  birthDate?: string;
}

export function NatalChartWheel({ birthDate }: NatalChartWheelProps) {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string } | null>(null);

  const date = useMemo(() => {
    if (birthDate) {
      const d = new Date(birthDate);
      if (!isNaN(d.getTime())) return d;
    }
    return new Date();
  }, [birthDate]);

  const planets = useMemo(() => getAllPlanetPositions(date), [date]);
  const displayPlanets = useMemo(() => spreadPlanets(planets), [planets]);
  const aspects = useMemo(() => findAspects(planets), [planets]);

  const handlePlanetHover = (p: PlanetPosition & { displayLon: number }, e: React.MouseEvent) => {
    const rect = (e.target as SVGElement).closest('svg')?.getBoundingClientRect();
    if (!rect) return;
    const signIdx = Math.floor(p.longitude / 30) % 12;
    setTooltip({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top - 10,
      text: `${PLANET_NAMES_TR[p.name] || p.name}: ${p.degree.toFixed(1)}° ${SIGN_NAMES[signIdx]}${p.retrograde ? ' \u211e' : ''}`,
    });
  };

  return (
    <div className="relative flex justify-center">
      <svg
        role="img"
        aria-label="Natal chart wheel showing planetary positions and aspects"
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="w-full max-w-[380px]"
        onMouseLeave={() => setTooltip(null)}
      >
        {/* Background */}
        <circle cx={CX} cy={CY} r={R_OUTER} fill="none" stroke="var(--color-border)" strokeWidth="1" />
        <circle cx={CX} cy={CY} r={R_INNER} fill="none" stroke="var(--color-border)" strokeWidth="1" />
        <circle cx={CX} cy={CY} r={R_ASPECT} fill="var(--color-bg)" fillOpacity="0.5" stroke="var(--color-border)" strokeWidth="0.5" />

        {/* Sign sectors */}
        {SIGN_SYMBOLS.map((sym, i) => {
          const startAngle = i * 30;
          const midAngle = startAngle + 15;
          const p1 = polar(CX, CY, R_INNER, startAngle);
          const p2 = polar(CX, CY, R_OUTER, startAngle);
          const mid = polar(CX, CY, R_SIGN_MID, midAngle);
          return (
            <g key={i}>
              {/* Divider line */}
              <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="var(--color-border)" strokeWidth="0.5" />
              {/* Sign symbol */}
              <text
                x={mid.x}
                y={mid.y}
                textAnchor="middle"
                dominantBaseline="central"
                fill={SIGN_COLORS[i]}
                fontSize="13"
                opacity="0.9"
              >
                {sym}
              </text>
            </g>
          );
        })}

        {/* Aspect lines */}
        {aspects.map((a, i) => {
          const p1 = polar(CX, CY, R_ASPECT, a.p1.longitude);
          const p2 = polar(CX, CY, R_ASPECT, a.p2.longitude);
          return (
            <line
              key={`asp-${i}`}
              x1={p1.x} y1={p1.y}
              x2={p2.x} y2={p2.y}
              stroke={a.aspect.color}
              strokeWidth="0.8"
              strokeDasharray={a.aspect.dash || 'none'}
              opacity="0.5"
            />
          );
        })}

        {/* Planets */}
        {displayPlanets.map((p) => {
          const pos = polar(CX, CY, R_PLANET, p.displayLon);
          const color = PLANET_COLORS[p.name] || '#e8e6f5';
          return (
            <g
              key={p.name}
              onMouseEnter={(e) => handlePlanetHover(p, e)}
              onMouseLeave={() => setTooltip(null)}
              className="cursor-pointer"
            >
              {/* Planet glow */}
              <circle cx={pos.x} cy={pos.y} r="11" fill={color} fillOpacity="0.1" />
              {/* Planet symbol */}
              <text
                x={pos.x}
                y={pos.y}
                textAnchor="middle"
                dominantBaseline="central"
                fill={color}
                fontSize="14"
                fontWeight="bold"
              >
                {PLANET_SYMBOLS[p.name] || p.name[0]}
              </text>
              {/* Retrograde indicator */}
              {p.retrograde && (
                <text
                  x={pos.x + 9}
                  y={pos.y - 7}
                  fill="#ef4444"
                  fontSize="7"
                  fontWeight="bold"
                >
                  R
                </text>
              )}
              {/* Degree tick on inner ring */}
              {(() => {
                const tick1 = polar(CX, CY, R_INNER - 3, p.longitude);
                const tick2 = polar(CX, CY, R_INNER + 3, p.longitude);
                return <line x1={tick1.x} y1={tick1.y} x2={tick2.x} y2={tick2.y} stroke={color} strokeWidth="1.5" opacity="0.7" />;
              })()}
            </g>
          );
        })}
      </svg>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="absolute pointer-events-none z-20 px-3 py-1.5 rounded-lg bg-surface border border-border text-xs text-text shadow-lg whitespace-nowrap animate-[fadeIn_0.1s_ease-out]"
          style={{ left: tooltip.x, top: tooltip.y, transform: 'translate(-50%, -100%)' }}
        >
          {tooltip.text}
        </div>
      )}

      {/* Aspect legend */}
      <div className="absolute bottom-0 right-0 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-muted">
        {ASPECTS.map((a) => (
          <span key={a.name} className="flex items-center gap-1">
            <span className="w-3 h-0.5 inline-block rounded" style={{ backgroundColor: a.color }} />
            {a.name}
          </span>
        ))}
      </div>
    </div>
  );
}
