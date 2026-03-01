import { BaseVisionUseCase } from './base-vision-use-case';
import { palmPrompt } from '@/application/prompt-templates';
import { buildProfilText } from '@/lib/openai/prompts';
import { getZodiacInfo } from '@/lib/astrology/zodiac-data';
import type { Profile } from '@/types/profile';

export interface PalmInput {
  imageBase64: string;
  profil?: Profile | null;
  lang?: string;
}

export class PalmUseCase extends BaseVisionUseCase<PalmInput> {
  protected buildVisionPrompt(input: PalmInput): { imageBase64: string; prompt: string; systemPrompt?: string } {
    const profilText = buildProfilText(input.profil) || '(profil bilgisi girilmedi)';

    let elementNot = '';
    if (input.profil?.burc) {
      const zodiac = getZodiacInfo(input.profil.burc);
      if (zodiac) {
        const elTipMap: Record<string, string> = {
          'Ateş': 'Ateş eli — uzun avuç, kısa parmaklar (enerjik, dinamik)',
          'Toprak': 'Toprak eli — kare avuç, kısa parmaklar (pratik, güvenilir)',
          'Hava': 'Hava eli — kare avuç, uzun parmaklar (iletişimci, düşünceli)',
          'Su': 'Su eli — uzun avuç, uzun parmaklar (sezgisel, duygusal)',
        };
        elementNot = `\n\nAstrolojik Bağlam: Kullanıcının burcu ${zodiac.nameTr} (${zodiac.elementTr} elementi). ${elTipMap[zodiac.elementTr] || ''}. Bu bilgiyi el yapısı analiziyle karşılaştır.`;
      }
    }

    const prompt = palmPrompt(profilText, elementNot, input.lang);
    return { imageBase64: input.imageBase64, prompt: prompt.userPrompt, systemPrompt: prompt.systemPrompt };
  }
}
