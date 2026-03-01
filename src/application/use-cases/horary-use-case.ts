import { BaseAIUseCase } from './base-ai-use-case';
import { horaryPrompt } from '@/application/prompt-templates';
import { buildProfilText } from '@/lib/openai/prompts';
import { getHoraryContext } from '@/lib/astrology/astro-context';
import type { PromptPair } from '@/domain/entities/prompt-pair';
import type { Profile } from '@/types/profile';

const KONU_AD: Record<string, string> = {
  ask: 'aşk/ilişkiler (7. ev)', is: 'iş/kariyer (10. ev)', para: 'para/finans (2. ev)',
  aile: 'aile (4. ev)', egitim: 'eğitim/gelişim (9. ev)', saglik: 'sağlık (6. ev)', diger: 'diğer',
};

const SURE_AD: Record<string, string> = {
  '24s': '24 saat', '7g': '7 gün', '1ay': '1 ay', '3ay': '3 ay', '6ay': '6 ay',
};

export interface HoraryInput {
  soru: string;
  konu: string;
  sure: string;
  profil?: Profile | null;
  lang?: string;
}

export class HoraryUseCase extends BaseAIUseCase<HoraryInput> {
  protected buildPrompt(input: HoraryInput): PromptPair {
    const profilText = buildProfilText(input.profil) || '(profil bilgisi girilmedi)';
    const konuAd = KONU_AD[input.konu] || input.konu;
    const sureAd = SURE_AD[input.sure] || input.sure;
    const uzmanUyari = input.konu === 'saglik' || input.konu === 'para'
      ? `\n\u26A0\uFE0F \u00D6NEML\u0130: "${konuAd}" konusunda mutlaka profesyonel uzman deste\u011Fi alman\u0131z \u00F6nerilir. Astrolojik yorum, profesyonel tavsiyenin yerini tutmaz.`
      : '';
    const now = new Date();
    const horaryCtx = getHoraryContext(input.konu, now);

    return horaryPrompt(input.soru, konuAd, sureAd, horaryCtx, profilText, uzmanUyari, now, input.lang);
  }
}
