import { BaseAIUseCase } from './base-ai-use-case';
import { moonSignPrompt } from '@/application/prompt-templates';
import { buildProfilText } from '@/lib/openai/prompts';
import { parseBirthDateTime } from '@/application/shared/parse-birth-datetime';
import { UseCaseError } from '@/domain/entities/use-case-error';
import * as Astronomy from 'astronomy-engine';
import type { PromptPair } from '@/domain/entities/prompt-pair';
import type { Profile } from '@/types/profile';

const SIGNS = ['Koç','Boğa','İkizler','Yengeç','Aslan','Başak','Terazi','Akrep','Yay','Oğlak','Kova','Balık'];

function getMoonSignForDate(date: Date): { sign: string; degree: number } {
  const moon = Astronomy.EclipticGeoMoon(date);
  const lon = ((moon.lon % 360) + 360) % 360;
  const idx = Math.floor(lon / 30) % 12;
  return { sign: SIGNS[idx], degree: lon % 30 };
}

export interface MoonSignInput {
  profil?: Profile | null;
  eminlik?: string;
  lang?: string;
}

export class MoonSignUseCase extends BaseAIUseCase<MoonSignInput> {
  protected buildPrompt(input: MoonSignInput): PromptPair {
    const profilText = buildProfilText(input.profil);
    if (!profilText) throw new UseCaseError('Profilde dolu alan yok.');

    const eminlikNot = input.eminlik ? `\nVeri eminlik seviyesi: ${input.eminlik}.` : '';

    let calcNote = '';
    if (input.profil?.['dogum-tarih']) {
      try {
        const birthDate = parseBirthDateTime(input.profil['dogum-tarih'], input.profil['dogum-saat']);
        if (birthDate) {
          const moonInfo = getMoonSignForDate(birthDate);
          calcNote = `\n\n**Hesaplanan Ay Burcu: ${moonInfo.sign} (${moonInfo.degree.toFixed(1)}°)**`;
        }
      } catch { /* calculation failed, continue with AI-only */ }
    }

    return moonSignPrompt(profilText, calcNote, eminlikNot, input.lang);
  }
}
