import { BaseAIUseCase } from './base-ai-use-case';
import { tarotPrompt } from '@/application/prompt-templates';
import { buildProfilText } from '@/lib/openai/prompts';
import { getAyContext } from '@/lib/astrology/astro-context';
import { TAROT_CARDS } from '@/data/tarot-cards';
import type { PromptPair } from '@/domain/entities/prompt-pair';
import type { Profile } from '@/types/profile';

export interface TarotInput {
  cards: Array<{ name: string; position: string; meaning?: string }>;
  profil?: Profile | null;
  lang?: string;
  crossContext?: string;
}

export class TarotUseCase extends BaseAIUseCase<TarotInput> {
  protected buildPrompt(input: TarotInput): PromptPair {
    const profilText = buildProfilText(input.profil);

    const cardDescriptions = input.cards
      .map((c) => {
        const cardData = TAROT_CARDS.find((t) => t.name === c.name);
        let astroNote = '';
        if (cardData) {
          const parts: string[] = [];
          if (cardData.planet) parts.push(`gezegen: ${cardData.planet}`);
          if (cardData.sign) parts.push(`burç: ${cardData.sign}`);
          if (cardData.element) parts.push(`element: ${cardData.element}`);
          if (parts.length) astroNote = ` [${parts.join(', ')}]`;
        }
        return `${c.position}: ${c.name}${c.meaning ? ` (${c.meaning})` : ''}${astroNote}`;
      })
      .join('\n');

    const ayCtx = getAyContext(new Date());

    return tarotPrompt(cardDescriptions, ayCtx, profilText, input.crossContext, input.lang);
  }
}
