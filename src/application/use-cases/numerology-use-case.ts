import { BaseAIUseCase } from './base-ai-use-case';
import { numerologyPrompt } from '@/application/prompt-templates';
import { buildProfilText } from '@/lib/openai/prompts';
import type { PromptPair } from '@/domain/entities/prompt-pair';
import type { Profile } from '@/types/profile';

export interface NumerologyInput {
  numbers: { yasamYolu: number; kader: number; ruhArzu: number; kisilik: number };
  ad: string;
  tarih?: string;
  profil?: Profile | null;
  lang?: string;
  crossContext?: string;
}

export class NumerologyUseCase extends BaseAIUseCase<NumerologyInput> {
  protected buildPrompt(input: NumerologyInput): PromptPair {
    const profilText = buildProfilText(input.profil);
    const profilNot = profilText
      ? `\nKullanıcı ek profil bilgileri:\n${profilText}`
      : '';
    return numerologyPrompt(input.numbers, input.ad, input.tarih, profilNot, input.crossContext, input.lang);
  }
}
