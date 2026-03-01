import * as Astronomy from 'astronomy-engine';

export type MoonPhaseName = 'Yeni Ay' | 'Hilal (Büyüyen)' | 'İlk Dördün' | 'Şişkin Ay (Büyüyen)' | 'Dolunay' | 'Şişkin Ay (Küçülen)' | 'Son Dördün' | 'Hilal (Küçülen)';

export interface MoonPhaseInfo {
  angle: number;        // 0-360
  illumination: number; // 0-100
  name: MoonPhaseName;
  emoji: string;
}

export function getMoonPhase(date: Date): MoonPhaseInfo {
  const angle = Astronomy.MoonPhase(date);
  const illum = Astronomy.Illumination('Moon' as Astronomy.Body, date);
  const illumination = Math.round(illum.phase_fraction * 100);
  
  let name: MoonPhaseName;
  let emoji: string;
  if (angle < 22.5) { name = 'Yeni Ay'; emoji = '🌑'; }
  else if (angle < 67.5) { name = 'Hilal (Büyüyen)'; emoji = '🌒'; }
  else if (angle < 112.5) { name = 'İlk Dördün'; emoji = '🌓'; }
  else if (angle < 157.5) { name = 'Şişkin Ay (Büyüyen)'; emoji = '🌔'; }
  else if (angle < 202.5) { name = 'Dolunay'; emoji = '🌕'; }
  else if (angle < 247.5) { name = 'Şişkin Ay (Küçülen)'; emoji = '🌖'; }
  else if (angle < 292.5) { name = 'Son Dördün'; emoji = '🌗'; }
  else if (angle < 337.5) { name = 'Hilal (Küçülen)'; emoji = '🌘'; }
  else { name = 'Yeni Ay'; emoji = '🌑'; }
  
  return { angle, illumination, name, emoji };
}
