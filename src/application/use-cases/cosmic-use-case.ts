import { BaseAIUseCase } from './base-ai-use-case';
import { cosmicPrompt } from '@/application/prompt-templates';
import { buildProfilText } from '@/lib/openai/prompts';
import type { PromptPair } from '@/domain/entities/prompt-pair';
import type { Profile } from '@/types/profile';

export interface CosmicInput {
  profil?: Profile | null;
  tarih?: string;
  gun?: string;
  web_data?: string;
  lang?: string;
}

export class CosmicUseCase extends BaseAIUseCase<CosmicInput> {
  protected buildPrompt(input: CosmicInput): PromptPair {
    const profilText = buildProfilText(input.profil) || '(profil bilgisi girilmedi)';
    return cosmicPrompt(profilText, input.tarih, input.gun, input.web_data, input.lang);
  }
}
