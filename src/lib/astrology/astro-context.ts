import { getAllPlanetPositions, getPlanetPosition, type PlanetPosition } from './ephemeris';
import { getMoonPhase } from './moon-phase';
import { getMercuryRetrograde } from './mercury-retrograde';
import { calculateNatalChart } from './natal-chart';
import { findAspects, ASPECT_NAMES_TR, type Aspect } from './aspects';
import { getTransits } from './transits';
import { geocode } from './geocoding';
import { ZODIAC_DATA } from './zodiac-data';
import type { Profile } from '@/types/profile';

// ── Planet name translations ──
const PLANET_TR: Record<string, string> = {
  Sun: 'Güneş', Moon: 'Ay', Mercury: 'Merkür', Venus: 'Venüs',
  Mars: 'Mars', Jupiter: 'Jüpiter', Saturn: 'Satürn',
  Uranus: 'Uranüs', Neptune: 'Neptün', Pluto: 'Plüton',
};

/**
 * Generate astronomical sky context for a given date.
 * Used by all routes to feed real planetary data into AI prompts.
 */
export function getGunlukContext(date: Date): string {
  const planets = getAllPlanetPositions(date);
  const moon = getMoonPhase(date);
  const mercury = getMercuryRetrograde(date);

  const planetLines = planets.map((p) => {
    const nameTr = PLANET_TR[p.name] || p.name;
    const retro = p.retrograde ? ' (R)' : '';
    return `${nameTr} ${p.sign} ${Math.round(p.degree)}°${retro}`;
  });

  const mercuryStatus = mercury.isRetrograde ? 'retro' : 'direkt';

  return `Günün Gökyüzü: ${planetLines.join(', ')}.
Ay Fazı: ${moon.name} ${moon.emoji} (%${Math.round(moon.illumination)} aydınlık).
Merkür: ${mercuryStatus} (hız: ${mercury.speed.toFixed(1)}°/gün).`;
}

/**
 * Generate natal chart context from user profile.
 * Returns null if profile lacks birth date + time + place.
 */
export async function getNatalContext(profil: Profile | null | undefined): Promise<string | null> {
  if (!profil) return null;

  const birthDateStr = profil['dogum-tarih'];
  const birthTimeStr = profil['dogum-saat'];
  const birthPlace = profil['dogum-yer'];

  if (!birthDateStr || !birthTimeStr || !birthPlace) return null;

  // Parse birth date
  const birthDate = new Date(birthDateStr);
  if (isNaN(birthDate.getTime())) return null;

  // Parse birth time range — take midpoint if range like "06:00-08:00"
  const timeMatch = birthTimeStr.match(/(\d{1,2}):(\d{2})/);
  if (timeMatch) {
    birthDate.setHours(parseInt(timeMatch[1]), parseInt(timeMatch[2]), 0, 0);
  }

  // Geocode birth place
  let geo;
  try {
    geo = await geocode(birthPlace);
  } catch {
    return null;
  }
  if (!geo) return null;

  // Calculate natal chart
  const chart = calculateNatalChart(birthDate, geo.lat, geo.lng);

  // Build planet summary
  const planetLines = chart.planets.map((p) => {
    const nameTr = PLANET_TR[p.name] || p.name;
    const retro = p.retrograde ? ' (R)' : '';
    return `${nameTr}: ${p.sign} ${Math.round(p.degree)}°${retro}`;
  });

  // Build aspect summary (top 8 tightest)
  const aspectLines = chart.aspects.slice(0, 8).map((a) => {
    const p1 = PLANET_TR[a.planet1] || a.planet1;
    const p2 = PLANET_TR[a.planet2] || a.planet2;
    const typeTr = ASPECT_NAMES_TR[a.type] || a.type;
    return `${p1} ${typeTr} ${p2} (${a.orb.toFixed(1)}° orb)`;
  });

  // Build house summary
  const houseLines = chart.houses.map((h) =>
    `${h.house}. Ev: ${h.sign} ${Math.round(h.degree)}°`
  );

  const ascSign = chart.ascendant.sign;
  const ascDeg = Math.round(chart.ascendant.degree);

  return `Natal Harita (${geo.displayName}, ${birthDateStr} ${birthTimeStr}):
Yükselen: ${ascSign} ${ascDeg}°
Gezegenler: ${planetLines.join(', ')}
Evler: ${houseLines.join(', ')}
Önemli Aspektler: ${aspectLines.join('; ')}`;
}

// ── Horary significator mapping ──
const KONU_SIGNIFICATOR: Record<string, { planet: string; house: string }> = {
  ask: { planet: 'Venus', house: '7. ev' },
  is: { planet: 'Saturn', house: '10. ev' },
  para: { planet: 'Jupiter', house: '2. ev' },
  aile: { planet: 'Moon', house: '4. ev' },
  egitim: { planet: 'Jupiter', house: '9. ev' },
  saglik: { planet: 'Sun', house: '6. ev' },
  diger: { planet: 'Moon', house: '1. ev' },
};

// ── Sign boundaries for void of course check ──
const SIGN_ORDER = ['Koç','Boğa','İkizler','Yengeç','Aslan','Başak','Terazi','Akrep','Yay','Oğlak','Kova','Balık'];

function getSignEndDegree(sign: string): number {
  const idx = SIGN_ORDER.indexOf(sign);
  return idx >= 0 ? (idx + 1) * 30 : 360;
}

/**
 * Find Moon's last separating and next applying aspects.
 */
function getMoonAspects(moonPos: PlanetPosition, planets: PlanetPosition[]): { last: string; next: string } {
  const others = planets.filter((p) => p.name !== 'Moon');
  const moonWithOthers = [
    { name: 'Moon', longitude: moonPos.longitude, speed: moonPos.speed },
    ...others.map((p) => ({ name: p.name, longitude: p.longitude, speed: p.speed })),
  ];
  const aspects = findAspects(moonWithOthers);
  const moonAspects = aspects.filter((a) => a.planet1 === 'Moon' || a.planet2 === 'Moon');

  let lastSep = '—';
  let nextApp = '—';

  const separating = moonAspects.filter((a) => !a.applying);
  const applying = moonAspects.filter((a) => a.applying);

  if (separating.length > 0) {
    const a = separating[0]; // tightest orb
    const other = a.planet1 === 'Moon' ? a.planet2 : a.planet1;
    lastSep = `Ay ${ASPECT_NAMES_TR[a.type]} ${PLANET_TR[other] || other} (${a.orb.toFixed(1)}° orb)`;
  }
  if (applying.length > 0) {
    const a = applying[0];
    const other = a.planet1 === 'Moon' ? a.planet2 : a.planet1;
    nextApp = `Ay ${ASPECT_NAMES_TR[a.type]} ${PLANET_TR[other] || other} (${a.orb.toFixed(1)}° orb)`;
  }

  return { last: lastSep, next: nextApp };
}

/**
 * Check if Moon is void of course (no applying aspects before leaving current sign).
 */
function isMoonVoidOfCourse(moonPos: PlanetPosition, planets: PlanetPosition[]): boolean {
  const others = planets.filter((p) => p.name !== 'Moon');
  const moonWithOthers = [
    { name: 'Moon', longitude: moonPos.longitude, speed: moonPos.speed },
    ...others.map((p) => ({ name: p.name, longitude: p.longitude, speed: p.speed })),
  ];
  const aspects = findAspects(moonWithOthers);
  const applyingMoonAspects = aspects.filter(
    (a) => (a.planet1 === 'Moon' || a.planet2 === 'Moon') && a.applying
  );

  if (applyingMoonAspects.length === 0) return true;

  // Check if the applying aspect completes before Moon leaves sign
  const signEnd = getSignEndDegree(moonPos.sign);
  const degreesLeft = signEnd - moonPos.longitude;
  if (degreesLeft <= 0) return true;

  // If the tightest applying aspect's orb is less than degrees left, Moon will perfect it
  return applyingMoonAspects[0].orb > degreesLeft;
}

/**
 * Get planetary dignity status (domicile, exaltation, detriment, fall).
 */
function getDignity(planetName: string, sign: string): string {
  // Reverse-map Turkish sign name to English for ZODIAC_DATA lookup
  const signEntry = Object.values(ZODIAC_DATA).find((z) => z.nameTr === sign);
  if (!signEntry) return '';

  const dignities: string[] = [];
  if (signEntry.ruler === planetName) dignities.push('haysiyetinde (güçlü)');
  if (signEntry.exaltation === planetName) dignities.push('yücelmede (güçlü)');
  if (signEntry.detriment === planetName) dignities.push('zararında (zayıf)');
  if (signEntry.fall === planetName) dignities.push('düşüşte (zayıf)');

  return dignities.length > 0 ? dignities.join(', ') : 'peregrin (nötr)';
}

/**
 * Generate horary astrology context for a given question topic and time.
 * HIGH accuracy: includes void of course, Moon aspects, significator dignity.
 */
export function getHoraryContext(konu: string, date: Date): string {
  const sig = KONU_SIGNIFICATOR[konu] || KONU_SIGNIFICATOR.diger;
  const sigPlanet = getPlanetPosition(sig.planet, date);
  const sigNameTr = PLANET_TR[sig.planet] || sig.planet;
  const sigDignity = getDignity(sig.planet, sigPlanet.sign);

  const moon = getMoonPhase(date);
  const moonPos = getPlanetPosition('Moon', date);

  const planets = getAllPlanetPositions(date);
  const retroPlanets = planets.filter((p) => p.retrograde);
  const retroText = retroPlanets.length > 0
    ? retroPlanets.map((p) => `${PLANET_TR[p.name] || p.name} (R)`).join(', ')
    : 'Retro gezegen yok';

  const voc = isMoonVoidOfCourse(moonPos, planets);
  const moonAspects = getMoonAspects(moonPos, planets);
  const moonDignity = getDignity('Moon', moonPos.sign);

  return `Horary Verisi (soru anı: ${date.toISOString()}):
Significator: ${sigNameTr} — ${sigPlanet.sign} ${Math.round(sigPlanet.degree)}° (${sigPlanet.retrograde ? 'retro' : 'direkt'}, hız: ${sigPlanet.speed.toFixed(1)}°/gün) — ${sig.house} yöneticisi — ${sigDignity}.
Ay: ${moonPos.sign} ${Math.round(moonPos.degree)}° — ${moon.name} ${moon.emoji} (%${Math.round(moon.illumination)} aydınlık) — ${moonDignity}.
Ay Boşlukta mı (Void of Course): ${voc ? 'EVET — Ay mevcut burçtan çıkmadan önce aspekt yapmıyor. Bu genelde "bir şey olmaz / bekle" anlamına gelir.' : 'Hayır — Ay aktif aspekt yapıyor.'}
Son ayrılan aspekt: ${moonAspects.last}.
Sonraki yaklaşan aspekt: ${moonAspects.next}.
Retro Gezegenler: ${retroText}.`;
}

/**
 * Get moon context for dream/tarot routes.
 */
export function getAyContext(date: Date): string {
  const moon = getMoonPhase(date);
  const moonPos = getPlanetPosition('Moon', date);
  const mercury = getMercuryRetrograde(date);

  const retroPlanets = getAllPlanetPositions(date).filter((p) => p.retrograde);
  const retroText = retroPlanets.length > 0
    ? retroPlanets.map((p) => `${PLANET_TR[p.name] || p.name}`).join(', ')
    : 'yok';

  return `Ay: ${moonPos.sign} ${Math.round(moonPos.degree)}° — ${moon.name} ${moon.emoji} (%${Math.round(moon.illumination)}).
Merkür: ${mercury.isRetrograde ? 'retro' : 'direkt'}.
Retro gezegenler: ${retroText}.`;
}

/**
 * Generate personal transit context from user profile.
 * Returns null if profile lacks birth date.
 * HIGH accuracy: calculates transit-to-natal aspects.
 */
export function getTransitContext(profil: Profile | null | undefined, transitDate: Date): string | null {
  if (!profil) return null;

  const birthDateStr = profil['dogum-tarih'];
  if (!birthDateStr) return null;

  const birthDate = new Date(birthDateStr);
  if (isNaN(birthDate.getTime())) return null;

  // Apply birth time if available
  const birthTimeStr = profil['dogum-saat'];
  if (birthTimeStr) {
    const timeMatch = birthTimeStr.match(/(\d{1,2}):(\d{2})/);
    if (timeMatch) {
      birthDate.setHours(parseInt(timeMatch[1]), parseInt(timeMatch[2]), 0, 0);
    }
  }

  const transits = getTransits(birthDate, transitDate);
  if (transits.length === 0) return null;

  // Top 6 tightest transit aspects
  const transitLines = transits.slice(0, 6).map((t) => {
    const tp = PLANET_TR[t.transitPlanet.name] || t.transitPlanet.name;
    const np = PLANET_TR[t.natalPlanet.name] || t.natalPlanet.name;
    const typeTr = ASPECT_NAMES_TR[t.aspect.type] || t.aspect.type;
    const applying = t.aspect.applying ? 'yaklaşan' : 'ayrılan';
    return `Transit ${tp} ${typeTr} Natal ${np} (${t.aspect.orb.toFixed(1)}° orb, ${applying})`;
  });

  return `Kişisel Transitler:\n${transitLines.join('\n')}`;
}
