import { BaseAIUseCase } from './base-ai-use-case';
import { uyumPrompt } from '@/application/prompt-templates';
import { buildProfilText } from '@/lib/openai/prompts';
import { getGunlukContext } from '@/lib/astrology/astro-context';
import { getZodiacInfo, getElementCompatibility, getModalityCompatibility } from '@/lib/astrology/zodiac-data';
import type { PromptPair } from '@/domain/entities/prompt-pair';
import type { Profile } from '@/types/profile';

const ILISKI_MAP: Record<string, string> = {
  romantik: 'romantik ilişki', arkadaslik: 'arkadaşlık',
  is: 'iş ortaklığı', aile: 'aile ilişkisi',
};

export interface UyumInput {
  burc1: string;
  burc2: string;
  iliski?: string;
  profil?: Profile | null;
  lang?: string;
  crossContext?: string;
}

export class UyumUseCase extends BaseAIUseCase<UyumInput> {
  protected buildPrompt(input: UyumInput): PromptPair {
    const profilText = buildProfilText(input.profil);
    const iliski = input.iliski || 'romantik';
    const iliskiAd = ILISKI_MAP[iliski] || 'ilişki';
    const profilNot = profilText
      ? `\nKullanıcı 1 (profil sahibi) ek bilgileri:\n${profilText}\nBu bilgileri yorum yaparken ${input.burc1} tarafı için kullan.`
      : '';

    const z1 = getZodiacInfo(input.burc1);
    const z2 = getZodiacInfo(input.burc2);
    let uyumVeri = '';
    if (z1 && z2) {
      const elemCompat = getElementCompatibility(z1.element, z2.element);
      const modCompat = getModalityCompatibility(z1.modality, z2.modality);
      uyumVeri = `\nAstrolojik Uyum Verisi:
${z1.nameTr}: ${z1.elementTr} elementi, ${z1.modalityTr} modalite, yönetici gezegen ${z1.rulerTr}.
${z2.nameTr}: ${z2.elementTr} elementi, ${z2.modalityTr} modalite, yönetici gezegen ${z2.rulerTr}.
Element uyumu: ${z1.elementTr}-${z2.elementTr} = ${elemCompat.description}.
Modalite uyumu: ${modCompat}.`;
    }

    const gokyuzu = getGunlukContext(new Date());

    return uyumPrompt(input.burc1, input.burc2, iliskiAd, uyumVeri, gokyuzu, profilNot, input.crossContext, input.lang);
  }
}
