import { BaseAIUseCase } from './base-ai-use-case';
import { burcCustomPrompt, burcMainPrompt } from '@/application/prompt-templates';
import { buildProfilText } from '@/lib/openai/prompts';
import { getGunlukContext, getNatalContext } from '@/lib/astrology/astro-context';
import { UseCaseError } from '@/domain/entities/use-case-error';
import type { PromptPair } from '@/domain/entities/prompt-pair';
import type { Profile } from '@/types/profile';

export interface BurcInput {
  profil?: Profile | null;
  lang?: string;
  customPrompt?: string;
  crossContext?: string;
}

export class BurcUseCase extends BaseAIUseCase<BurcInput> {
  protected shouldSaveAnalysis(input: BurcInput): boolean {
    return !input.customPrompt;
  }

  protected async buildPrompt(input: BurcInput): Promise<PromptPair> {
    if (input.customPrompt) {
      return burcCustomPrompt(input.customPrompt, input.lang);
    }

    const profilText = buildProfilText(input.profil);
    if (!profilText) throw new UseCaseError('Profilde dolu alan yok.');

    const gokyuzu = getGunlukContext(new Date());
    const natalCtx = await getNatalContext(input.profil);
    const astroNot = natalCtx
      ? `\n\nNatal Harita Verisi:\n${natalCtx}\n\nGünün Gökyüzü:\n${gokyuzu}`
      : `\n\nGünün Gökyüzü:\n${gokyuzu}`;

    return burcMainPrompt(profilText, astroNot, input.crossContext, input.lang);
  }
}
