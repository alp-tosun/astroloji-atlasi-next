import { BaseAIUseCase } from './base-ai-use-case';
import { risingPrompt } from '@/application/prompt-templates';
import { buildProfilText } from '@/lib/openai/prompts';
import { getRisingSign } from '@/lib/astrology/rising-sign';
import { geocode } from '@/lib/astrology/geocoding';
import { parseBirthDateTime } from '@/application/shared/parse-birth-datetime';
import { UseCaseError } from '@/domain/entities/use-case-error';
import type { PromptPair } from '@/domain/entities/prompt-pair';
import type { Profile } from '@/types/profile';

export interface RisingInput {
  profil?: Profile | null;
  eminlik?: string;
  lang?: string;
}

export class RisingUseCase extends BaseAIUseCase<RisingInput> {
  protected async buildPrompt(input: RisingInput): Promise<PromptPair> {
    const profilText = buildProfilText(input.profil);
    if (!profilText) throw new UseCaseError('Profilde dolu alan yok.');

    const eminlikNot = input.eminlik ? `\nVeri eminlik seviyesi: ${input.eminlik}.` : '';

    let calcNote = '';
    if (input.profil?.['dogum-tarih'] && input.profil?.['dogum-saat'] && input.profil?.['dogum-yer']) {
      try {
        const birthDate = parseBirthDateTime(input.profil['dogum-tarih'], input.profil['dogum-saat']);
        const geo = await geocode(input.profil['dogum-yer']);
        if (birthDate && geo) {
          const rising = getRisingSign(birthDate, geo.lat, geo.lng);
          calcNote = `\n\n**Hesaplanan Yükselen Burç: ${rising.sign} (${rising.degree.toFixed(1)}°)**\nKoordinat: ${geo.lat.toFixed(2)}°N, ${geo.lng.toFixed(2)}°E`;
        }
      } catch { /* calculation failed, continue with AI-only */ }
    }

    return risingPrompt(profilText, calcNote, eminlikNot, input.lang);
  }
}
