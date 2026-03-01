import { BaseAIUseCase } from './base-ai-use-case';
import { gunlukPrompt } from '@/application/prompt-templates';
import { buildProfilText } from '@/lib/openai/prompts';
import { getGunlukContext, getTransitContext } from '@/lib/astrology/astro-context';
import type { PromptPair } from '@/domain/entities/prompt-pair';
import type { Profile } from '@/types/profile';

const ODAK_MAP: Record<string, string> = {
  genel: 'tüm alanlar (aşk, iş, sağlık, para)',
  ask: 'aşk ve ilişkiler',
  is: 'iş ve kariyer',
  saglik: 'sağlık ve enerji',
  para: 'para ve bolluk',
};

export interface GunlukInput {
  burc: string;
  odak?: string;
  profil?: Profile | null;
  lang?: string;
  crossContext?: string;
}

export class GunlukUseCase extends BaseAIUseCase<GunlukInput> {
  protected buildPrompt(input: GunlukInput): PromptPair {
    const profilText = buildProfilText(input.profil);
    const now = new Date();
    const tarihStr = now.toLocaleDateString('tr-TR', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });
    const odak = input.odak || 'genel';
    const odakAd = ODAK_MAP[odak] || 'genel';
    const profilNot = profilText
      ? `\nKullanıcı profil bilgileri (analizi kişiselleştirmek için kullan):\n${profilText}`
      : '';
    const gokyuzu = getGunlukContext(now);
    const transitCtx = getTransitContext(input.profil, now);
    const transitNot = transitCtx
      ? `\n\n${transitCtx}\nBu transitleri yorumda somut şekilde kullan — hangi gezegen hangi natal gezegene aspekt yapıyorsa o alanı vurgula.`
      : '';

    return gunlukPrompt(tarihStr, input.burc, odakAd, odak, gokyuzu, transitNot, profilNot, input.crossContext, input.lang);
  }
}
