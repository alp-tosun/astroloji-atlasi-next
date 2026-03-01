import { BaseCachedAIUseCase } from './base-cached-ai-use-case';
import { ritualPrompt } from '@/application/prompt-templates';
import { buildProfilText } from '@/lib/openai/prompts';
import { getMoonPhase } from '@/lib/astrology/moon-phase';
import { getPlanetPosition } from '@/lib/astrology/ephemeris';
import * as Astronomy from 'astronomy-engine';
import type { PromptPair } from '@/domain/entities/prompt-pair';
import type { Profile } from '@/types/profile';

const SIGNS = ['Koç','Boğa','İkizler','Yengeç','Aslan','Başak','Terazi','Akrep','Yay','Oğlak','Kova','Balık'];
const DAY_RULERS = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
const PLANET_TR: Record<string, string> = {
  Sun: 'Güneş', Moon: 'Ay', Mars: 'Mars', Mercury: 'Merkür',
  Jupiter: 'Jüpiter', Venus: 'Venüs', Saturn: 'Satürn',
};

function getMoonSign(date: Date): string {
  const moon = Astronomy.EclipticGeoMoon(date);
  const lon = ((moon.lon % 360) + 360) % 360;
  const idx = Math.floor(lon / 30) % 12;
  return SIGNS[idx];
}

export interface RitualInput {
  profil?: Profile | null;
  lang?: string;
}

export class RitualUseCase extends BaseCachedAIUseCase<RitualInput> {
  protected getCollection(): string {
    return 'rituals';
  }

  protected getCacheKey(_input: RitualInput, uid: string): string {
    const now = new Date();
    const dateKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    return uid ? `${uid}_${dateKey}` : `anon_${dateKey}`;
  }

  protected buildPrompt(input: RitualInput): PromptPair {
    const now = new Date();
    const moonPhaseData = getMoonPhase(now);
    const moonSign = getMoonSign(now);
    const dayOfWeek = now.getDay();
    const dayRuler = DAY_RULERS[dayOfWeek];
    const dayRulerTR = PLANET_TR[dayRuler] || dayRuler;
    const rulerPosition = getPlanetPosition(dayRuler, now);
    const profilText = buildProfilText(input.profil) || '(profil bilgisi girilmedi)';
    const dateStr = now.toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' });

    return ritualPrompt(
      moonPhaseData.name, moonPhaseData.emoji, Math.round(moonPhaseData.illumination),
      moonSign, dayRulerTR,
      rulerPosition.sign, rulerPosition.degree.toFixed(1),
      rulerPosition.retrograde ? ' \u211E' : '',
      dateStr, profilText, input.lang,
    );
  }
}
