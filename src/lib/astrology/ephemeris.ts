import * as Astronomy from 'astronomy-engine';

export interface PlanetPosition {
  name: string;
  longitude: number;
  latitude: number;
  speed: number;
  retrograde: boolean;
  sign: string;
  degree: number;
}

const SIGNS = ['Koç','Boğa','İkizler','Yengeç','Aslan','Başak','Terazi','Akrep','Yay','Oğlak','Kova','Balık'];

function lonToSign(lon: number): { sign: string; degree: number } {
  const n = ((lon % 360) + 360) % 360;
  const idx = Math.floor(n / 30) % 12;
  return { sign: SIGNS[idx], degree: n % 30 };
}

const PLANET_BODIES = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'] as const;

const defaultObserver = new Astronomy.Observer(0, 0, 0);

export function getJulianDay(date: Date): number {
  // J2000 epoch is 2000-01-01T12:00:00Z = JD 2451545.0
  const msPerDay = 86400000;
  const j2000 = Date.UTC(2000, 0, 1, 12, 0, 0);
  return 2451545.0 + (date.getTime() - j2000) / msPerDay;
}

function getSunPosition(date: Date): { longitude: number; latitude: number } {
  const sun = Astronomy.SunPosition(date);
  return { longitude: sun.elon, latitude: sun.elat };
}

function getMoonPosition(date: Date): { longitude: number; latitude: number } {
  const moon = Astronomy.EclipticGeoMoon(date);
  return { longitude: moon.lon, latitude: moon.lat };
}

function getBodyPosition(body: string, date: Date): { longitude: number; latitude: number } {
  if (body === 'Sun') return getSunPosition(date);
  if (body === 'Moon') return getMoonPosition(date);

  const eq = Astronomy.Equator(body as Astronomy.Body, date, defaultObserver, true, true);
  const ecl = Astronomy.Ecliptic(eq.vec);
  return { longitude: ecl.elon, latitude: ecl.elat };
}

function computeSpeed(body: string, date: Date): number {
  const msPerDay = 86400000;
  const before = new Date(date.getTime() - msPerDay);
  const after = new Date(date.getTime() + msPerDay);

  const lonBefore = getBodyPosition(body, before).longitude;
  const lonAfter = getBodyPosition(body, after).longitude;

  let diff = lonAfter - lonBefore;
  // Handle 360° wraparound
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;

  return diff / 2;
}

export function getPlanetPosition(body: string, date: Date): PlanetPosition {
  const pos = getBodyPosition(body, date);
  const speed = computeSpeed(body, date);
  const { sign, degree } = lonToSign(pos.longitude);

  return {
    name: body,
    longitude: Math.round(pos.longitude * 10000) / 10000,
    latitude: Math.round(pos.latitude * 10000) / 10000,
    speed: Math.round(speed * 10000) / 10000,
    retrograde: speed < 0,
    sign,
    degree: Math.round(degree * 10000) / 10000,
  };
}

export function getAllPlanetPositions(date: Date): PlanetPosition[] {
  return PLANET_BODIES.map((body) => getPlanetPosition(body, date));
}

export function getMoonIllumination(date: Date): number {
  const illum = Astronomy.Illumination('Moon' as Astronomy.Body, date);
  return Math.round(illum.phase_fraction * 100);
}

export function getMoonPhaseAngle(date: Date): number {
  return Astronomy.MoonPhase(date);
}
