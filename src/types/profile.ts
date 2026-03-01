export const PROFILE_FIELDS = ['ad', 'cinsiyet', 'dogum-tarih', 'dogum-saat', 'dogum-yer', 'burc', 'yukselen', 'ay-burcu', 'iliski-durumu'] as const;

export type ProfileFieldId = (typeof PROFILE_FIELDS)[number];

export interface Profile {
  [key: string]: string | undefined;
  ad?: string;
  cinsiyet?: string;
  'dogum-tarih'?: string;
  'dogum-saat'?: string;
  'dogum-yer'?: string;
  burc?: string;
  yukselen?: string;
  'ay-burcu'?: string;
  'iliski-durumu'?: string;
}

export const SINYAL_AGIRLIK: Record<ProfileFieldId, number> = {
  'dogum-tarih': 20,
  'dogum-yer': 15,
  'dogum-saat': 15,
  burc: 15,
  yukselen: 10,
  'ay-burcu': 10,
  cinsiyet: 5,
  'iliski-durumu': 5,
  ad: 5,
};

export const SINYAL_MAX = Object.values(SINYAL_AGIRLIK).reduce((a, b) => a + b, 0);

export const PREMIUM_TOOLS = ['uyum', 'num', 'ruya', 'el', 'kosm', 'horar', 'haftalik', 'aylik', 'tarot'] as const;

export type ToolId = 'burc' | 'el' | 'yuk' | 'ay-burc' | 'kosm' | 'num' | 'ruya' | 'horar' | 'gunluk' | 'uyum' | 'gecmis' | 'gezegen' | 'gunun-karti' | 'haftalik' | 'aylik' | 'transit' | 'ay-takvimi' | 'gezegen-saatleri' | 'rituel' | 'tarot';
