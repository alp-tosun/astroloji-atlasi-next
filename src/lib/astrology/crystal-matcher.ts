import { CRYSTALS, SIGN_ELEMENTS, type Crystal } from '@/data/crystal-data';
import type { MoonPhaseName } from './moon-phase';

export interface CrystalMatch {
  crystal: Crystal;
  score: number;
  reasons: string[];
}

export interface CrystalMatchInput {
  sunSign?: string;
  risingSign?: string;
  moonSign?: string;
  intention: string;
  moonPhase: MoonPhaseName;
  hasRetrograde: boolean;
}

export function matchCrystals(input: CrystalMatchInput): CrystalMatch[] {
  const results: CrystalMatch[] = [];

  // Determine user element from sun sign
  const userElement = input.sunSign ? SIGN_ELEMENTS[input.sunSign] : null;

  for (const crystal of CRYSTALS) {
    let score = 0;
    const reasons: string[] = [];

    // Sun sign match: +3
    if (input.sunSign && crystal.signs.includes(input.sunSign)) {
      score += 3;
      reasons.push(`Güneş burcu (${input.sunSign}) uyumu`);
    }

    // Rising sign match: +2
    if (input.risingSign && crystal.signs.includes(input.risingSign)) {
      score += 2;
      reasons.push(`Yükselen burç (${input.risingSign}) uyumu`);
    }

    // Moon sign match: +2
    if (input.moonSign && crystal.signs.includes(input.moonSign)) {
      score += 2;
      reasons.push(`Ay burcu (${input.moonSign}) uyumu`);
    }

    // Intention match: +3
    if (crystal.intentions.includes(input.intention)) {
      score += 3;
      reasons.push('Niyet uyumu');
    }

    // Moon phase match: +2
    if (crystal.moonPhases.includes(input.moonPhase)) {
      score += 2;
      reasons.push('Ay fazı uyumu');
    }

    // Retrograde support: +2 (only when retro active)
    if (input.hasRetrograde && crystal.retroSupport) {
      score += 2;
      reasons.push('Retro destek');
    }

    // Element match: +1
    if (userElement && crystal.elements.includes(userElement)) {
      score += 1;
      reasons.push('Element uyumu');
    }

    if (score > 0) {
      results.push({ crystal, score, reasons });
    }
  }

  // Sort by score descending, return top 5
  return results.sort((a, b) => b.score - a.score).slice(0, 5);
}
