export type AspectType = 'conjunction' | 'sextile' | 'square' | 'trine' | 'opposition';

export interface Aspect {
  planet1: string;
  planet2: string;
  type: AspectType;
  angle: number;     // exact angle between planets
  orb: number;       // difference from exact aspect
  applying: boolean; // is the aspect getting tighter?
}

const ASPECT_ANGLES: Record<AspectType, number> = {
  conjunction: 0,
  sextile: 60,
  square: 90,
  trine: 120,
  opposition: 180,
};

const DEFAULT_ORBS: Record<AspectType, number> = {
  conjunction: 8,
  sextile: 6,
  square: 7,
  trine: 8,
  opposition: 8,
};

export const ASPECT_NAMES_TR: Record<AspectType, string> = {
  conjunction: 'Kavuşum',
  sextile: 'Sekstil',
  square: 'Kare',
  trine: 'Üçgen',
  opposition: 'Karşıt',
};

function angleDiff(a: number, b: number): number {
  let diff = Math.abs(a - b) % 360;
  if (diff > 180) diff = 360 - diff;
  return diff;
}

export function findAspects(
  positions: Array<{ name: string; longitude: number; speed: number }>,
  orbs: Record<AspectType, number> = DEFAULT_ORBS
): Aspect[] {
  const aspects: Aspect[] = [];
  
  for (let i = 0; i < positions.length; i++) {
    for (let j = i + 1; j < positions.length; j++) {
      const p1 = positions[i];
      const p2 = positions[j];
      const diff = angleDiff(p1.longitude, p2.longitude);
      
      for (const [type, angle] of Object.entries(ASPECT_ANGLES) as [AspectType, number][]) {
        const orb = Math.abs(diff - angle);
        if (orb <= orbs[type]) {
          // Determine if applying: faster planet moving toward exact aspect
          const applying = Math.abs(p1.speed) > Math.abs(p2.speed)
            ? p1.speed > 0  // simplified
            : p2.speed > 0;
          
          aspects.push({
            planet1: p1.name,
            planet2: p2.name,
            type,
            angle: Math.round(diff * 100) / 100,
            orb: Math.round(orb * 100) / 100,
            applying,
          });
          break; // Only one aspect per planet pair
        }
      }
    }
  }
  
  return aspects.sort((a, b) => a.orb - b.orb);
}
