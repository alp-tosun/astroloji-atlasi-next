import { getPlanetPosition } from './ephemeris';

export interface MercuryRetroInfo {
  isRetrograde: boolean;
  speed: number;  // deg/day, negative = retrograde
  phase: 'direct' | 'stationary-retrograde' | 'retrograde' | 'stationary-direct';
}

export function getMercuryRetrograde(date: Date): MercuryRetroInfo {
  const merc = getPlanetPosition('Mercury', date);
  const speed = merc.speed;
  const isRetrograde = speed < 0;
  
  let phase: MercuryRetroInfo['phase'];
  if (Math.abs(speed) < 0.1) {
    phase = isRetrograde ? 'stationary-retrograde' : 'stationary-direct';
  } else {
    phase = isRetrograde ? 'retrograde' : 'direct';
  }
  
  return { isRetrograde, speed, phase };
}

// Check retrograde status for any planet
export function isRetrograde(planet: string, date: Date): boolean {
  const pos = getPlanetPosition(planet, date);
  return pos.retrograde;
}
