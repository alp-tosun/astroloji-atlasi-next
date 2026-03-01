import { BaseAIUseCase } from './base-ai-use-case';
import { transitKisiselPrompt } from '@/application/prompt-templates';
import { buildProfilText } from '@/lib/openai/prompts';
import { getGunlukContext } from '@/lib/astrology/astro-context';
import { getMoonPhase } from '@/lib/astrology/moon-phase';
import type { PromptPair } from '@/domain/entities/prompt-pair';
import type { Profile } from '@/types/profile';

export interface TransitKisiselInput {
  profil?: Profile | null;
  lang?: string;
  transitSummary: string;
  crossContext?: string;
}

export class TransitKisiselUseCase extends BaseAIUseCase<TransitKisiselInput> {
  protected buildPrompt(input: TransitKisiselInput): PromptPair {
    const profilText = buildProfilText(input.profil) || '(profil bilgisi girilmedi)';
    const gokyuzu = getGunlukContext(new Date());
    const moon = getMoonPhase(new Date());

    return transitKisiselPrompt(
      input.transitSummary,
      gokyuzu,
      `${moon.name} ${moon.emoji} (%${Math.round(moon.illumination)})`,
      profilText,
      input.crossContext,
      input.lang,
    );
  }
}
