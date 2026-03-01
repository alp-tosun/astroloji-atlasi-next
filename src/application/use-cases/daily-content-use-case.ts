import { BaseCachedAIUseCase } from './base-cached-ai-use-case';
import {
  dailyContentGununKartiPrompt,
  dailyContentHaftalikPrompt,
  dailyContentAylikPrompt,
} from '@/application/prompt-templates';
import { buildProfilText } from '@/lib/openai/prompts';
import { getPlanetPosition } from '@/lib/astrology/ephemeris';
import type { PromptPair } from '@/domain/entities/prompt-pair';
import type { Profile } from '@/types/profile';

type ContentType = 'gunun-karti' | 'haftalik' | 'aylik';

const DAY_RULERS = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
const PLANET_TR: Record<string, string> = {
  Sun: 'Güneş', Moon: 'Ay', Mars: 'Mars', Mercury: 'Merkür',
  Jupiter: 'Jüpiter', Venus: 'Venüs', Saturn: 'Satürn',
};
const PLANET_CARDS: Record<string, { card: string; icon: string; meaning: string }> = {
  Sun: { card: 'Güneş Kartı', icon: '☀️', meaning: 'Canlılık, başarı, enerji, kendini ifade etme' },
  Moon: { card: 'Ay Kartı', icon: '🌙', meaning: 'Sezgi, duygular, iç dünya, bilinçaltı' },
  Mars: { card: 'Savaşçı Kartı', icon: '⚔️', meaning: 'Cesaret, eylem, tutku, mücadele' },
  Mercury: { card: 'Haberci Kartı', icon: '📜', meaning: 'İletişim, zeka, hız, bilgi' },
  Jupiter: { card: 'Şans Kartı', icon: '🍀', meaning: 'Bolluk, genişleme, bilgelik, şans' },
  Venus: { card: 'Aşk Kartı', icon: '💫', meaning: 'Aşk, güzellik, uyum, çekim' },
  Saturn: { card: 'Bilge Kartı', icon: '🏛️', meaning: 'Disiplin, sabır, yapı, ders' },
};

export interface DailyContentInput {
  type: ContentType;
  lang?: string;
  burc?: string;
  profil?: Profile | null;
}

export class DailyContentUseCase extends BaseCachedAIUseCase<DailyContentInput> {
  protected getCollection(): string {
    return 'daily-content';
  }

  protected getCacheKey(input: DailyContentInput, uid: string): string {
    const now = new Date();
    const baseKey = this.computeBaseKey(input.type, now);
    const suffix = uid ? `_u${uid}` : (input.burc ? `_${input.burc}` : '');
    return `${input.type}_${baseKey}${suffix}`;
  }

  private computeBaseKey(type: ContentType, now: Date): string {
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');

    switch (type) {
      case 'gunun-karti':
        return `${y}-${m}-${d}`;
      case 'haftalik': {
        // Use Monday's date as the stable weekly key
        const day = now.getDay();
        const monday = new Date(now);
        monday.setDate(now.getDate() - ((day + 6) % 7));
        const wm = String(monday.getMonth() + 1).padStart(2, '0');
        const wd = String(monday.getDate()).padStart(2, '0');
        return `${monday.getFullYear()}-${wm}-${wd}`;
      }
      case 'aylik':
        return `${y}-${m}`;
    }
  }

  private computePrefix(input: DailyContentInput): string {
    if (input.type !== 'gunun-karti') return '';
    const now = new Date();
    const dayOfWeek = now.getDay();
    const ruler = DAY_RULERS[dayOfWeek];
    const planet = getPlanetPosition(ruler, now);
    return `**Yönetici Gezegen:** ${PLANET_TR[ruler]} (${planet.sign} ${planet.degree.toFixed(0)}°)\n\n`;
  }

  protected transformForCache(full: string, input: DailyContentInput): string {
    return this.computePrefix(input) + full;
  }

  protected buildPrompt(input: DailyContentInput): PromptPair {
    const profilText = buildProfilText(input.profil);
    const now = new Date();

    if (input.type === 'gunun-karti') {
      const dayOfWeek = now.getDay();
      const ruler = DAY_RULERS[dayOfWeek];
      const planet = getPlanetPosition(ruler, now);
      const cardInfo = PLANET_CARDS[ruler];

      const dateStr = now.toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' });
      return dailyContentGununKartiPrompt(
        cardInfo, PLANET_TR[ruler],
        planet.sign, planet.degree.toFixed(1), planet.retrograde ? ' ℞' : '',
        dateStr, input.burc || '', profilText, input.lang,
      );
    }

    if (input.type === 'haftalik') {
      const dateStr = now.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
      return dailyContentHaftalikPrompt(input.burc || '', dateStr, profilText, input.lang);
    }

    // aylik
    const monthName = now.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });
    return dailyContentAylikPrompt(input.burc || '', monthName, profilText, input.lang);
  }
}
