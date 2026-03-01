import { BaseAIUseCase } from './base-ai-use-case';
import { dreamPrompt } from '@/application/prompt-templates';
import { buildProfilText } from '@/lib/openai/prompts';
import { getAyContext } from '@/lib/astrology/astro-context';
import type { PromptPair } from '@/domain/entities/prompt-pair';
import type { Profile } from '@/types/profile';

export interface DreamInput {
  metin: string;
  profil?: Profile | null;
  lang?: string;
}

export class DreamUseCase extends BaseAIUseCase<DreamInput> {
  protected buildPrompt(input: DreamInput): PromptPair {
    const profilText = buildProfilText(input.profil) || '(profil bilgisi girilmedi)';
    const ayCtx = getAyContext(new Date());
    return dreamPrompt(input.metin, ayCtx, profilText, input.lang);
  }
}
