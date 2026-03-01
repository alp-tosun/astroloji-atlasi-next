import { getPlanetPosition } from './ephemeris';

export function getSunSign(date: Date): { sign: string; degree: number; longitude: number } {
  const sun = getPlanetPosition('Sun', date);
  return { sign: sun.sign, degree: sun.degree, longitude: sun.longitude };
}

// Check if date is on cusp (within 1 day of sign boundary)
export function isCusp(date: Date): boolean {
  const sun = getPlanetPosition('Sun', date);
  return sun.degree < 1 || sun.degree > 29;
}
