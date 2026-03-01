import { BaseAIUseCase } from './base-ai-use-case';
import { yildizNamePrompt } from '@/application/prompt-templates';
import { buildProfilText } from '@/lib/openai/prompts';
import type { PromptPair } from '@/domain/entities/prompt-pair';
import type { Profile } from '@/types/profile';

export interface YildizNameInput {
  profil?: Profile | null;
  lang?: string;
  yildizSummary: string;
  crossContext?: string;
}

export class YildizNameUseCase extends BaseAIUseCase<YildizNameInput> {
  protected buildPrompt(input: YildizNameInput): PromptPair {
    const profilText = buildProfilText(input.profil) || '(profil bilgisi girilmedi)';
    return yildizNamePrompt(input.yildizSummary, profilText, input.crossContext, input.lang);
  }
}
