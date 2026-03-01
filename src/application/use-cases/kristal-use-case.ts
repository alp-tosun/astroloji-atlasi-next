import { BaseAIUseCase } from './base-ai-use-case';
import { kristalPrompt } from '@/application/prompt-templates';
import { buildProfilText } from '@/lib/openai/prompts';
import { getMoonPhase } from '@/lib/astrology/moon-phase';
import { getGunlukContext } from '@/lib/astrology/astro-context';
import type { PromptPair } from '@/domain/entities/prompt-pair';
import type { Profile } from '@/types/profile';

export interface KristalInput {
  profil?: Profile | null;
  lang?: string;
  crystalSummary: string;
  intention?: string;
  crossContext?: string;
}

export class KristalUseCase extends BaseAIUseCase<KristalInput> {
  protected buildPrompt(input: KristalInput): PromptPair {
    const profilText = buildProfilText(input.profil) || '(profil bilgisi girilmedi)';
    const moon = getMoonPhase(new Date());
    const gokyuzu = getGunlukContext(new Date());

    return kristalPrompt(
      input.crystalSummary,
      input.intention || 'genel',
      `${moon.name} ${moon.emoji} (%${Math.round(moon.illumination)})`,
      gokyuzu,
      profilText,
      input.crossContext,
      input.lang,
    );
  }
}
