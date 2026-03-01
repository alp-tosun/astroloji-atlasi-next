export interface ZodiacInfo {
  name: string;
  nameTr: string;
  element: 'fire' | 'earth' | 'air' | 'water';
  elementTr: string;
  modality: 'cardinal' | 'fixed' | 'mutable';
  modalityTr: string;
  ruler: string;
  rulerTr: string;
  detriment: string;
  exaltation: string;
  fall: string;
}

export const ZODIAC_DATA: Record<string, ZodiacInfo> = {
  Aries: {
    name: 'Aries', nameTr: 'Koç',
    element: 'fire', elementTr: 'Ateş',
    modality: 'cardinal', modalityTr: 'Kardinal',
    ruler: 'Mars', rulerTr: 'Mars',
    detriment: 'Venus', exaltation: 'Sun', fall: 'Saturn',
  },
  Taurus: {
    name: 'Taurus', nameTr: 'Boğa',
    element: 'earth', elementTr: 'Toprak',
    modality: 'fixed', modalityTr: 'Sabit',
    ruler: 'Venus', rulerTr: 'Venüs',
    detriment: 'Mars', exaltation: 'Moon', fall: 'Uranus',
  },
  Gemini: {
    name: 'Gemini', nameTr: 'İkizler',
    element: 'air', elementTr: 'Hava',
    modality: 'mutable', modalityTr: 'Değişken',
    ruler: 'Mercury', rulerTr: 'Merkür',
    detriment: 'Jupiter', exaltation: 'North Node', fall: 'South Node',
  },
  Cancer: {
    name: 'Cancer', nameTr: 'Yengeç',
    element: 'water', elementTr: 'Su',
    modality: 'cardinal', modalityTr: 'Kardinal',
    ruler: 'Moon', rulerTr: 'Ay',
    detriment: 'Saturn', exaltation: 'Jupiter', fall: 'Mars',
  },
  Leo: {
    name: 'Leo', nameTr: 'Aslan',
    element: 'fire', elementTr: 'Ateş',
    modality: 'fixed', modalityTr: 'Sabit',
    ruler: 'Sun', rulerTr: 'Güneş',
    detriment: 'Saturn', exaltation: 'Neptune', fall: 'Uranus',
  },
  Virgo: {
    name: 'Virgo', nameTr: 'Başak',
    element: 'earth', elementTr: 'Toprak',
    modality: 'mutable', modalityTr: 'Değişken',
    ruler: 'Mercury', rulerTr: 'Merkür',
    detriment: 'Jupiter', exaltation: 'Mercury', fall: 'Venus',
  },
  Libra: {
    name: 'Libra', nameTr: 'Terazi',
    element: 'air', elementTr: 'Hava',
    modality: 'cardinal', modalityTr: 'Kardinal',
    ruler: 'Venus', rulerTr: 'Venüs',
    detriment: 'Mars', exaltation: 'Saturn', fall: 'Sun',
  },
  Scorpio: {
    name: 'Scorpio', nameTr: 'Akrep',
    element: 'water', elementTr: 'Su',
    modality: 'fixed', modalityTr: 'Sabit',
    ruler: 'Pluto', rulerTr: 'Plüton',
    detriment: 'Venus', exaltation: 'Uranus', fall: 'Moon',
  },
  Sagittarius: {
    name: 'Sagittarius', nameTr: 'Yay',
    element: 'fire', elementTr: 'Ateş',
    modality: 'mutable', modalityTr: 'Değişken',
    ruler: 'Jupiter', rulerTr: 'Jüpiter',
    detriment: 'Mercury', exaltation: 'South Node', fall: 'North Node',
  },
  Capricorn: {
    name: 'Capricorn', nameTr: 'Oğlak',
    element: 'earth', elementTr: 'Toprak',
    modality: 'cardinal', modalityTr: 'Kardinal',
    ruler: 'Saturn', rulerTr: 'Satürn',
    detriment: 'Moon', exaltation: 'Mars', fall: 'Jupiter',
  },
  Aquarius: {
    name: 'Aquarius', nameTr: 'Kova',
    element: 'air', elementTr: 'Hava',
    modality: 'fixed', modalityTr: 'Sabit',
    ruler: 'Uranus', rulerTr: 'Uranüs',
    detriment: 'Sun', exaltation: 'Uranus', fall: 'Neptune',
  },
  Pisces: {
    name: 'Pisces', nameTr: 'Balık',
    element: 'water', elementTr: 'Su',
    modality: 'mutable', modalityTr: 'Değişken',
    ruler: 'Neptune', rulerTr: 'Neptün',
    detriment: 'Mercury', exaltation: 'Venus', fall: 'Mercury',
  },
};

// Turkish name → English key lookup
const TR_TO_EN: Record<string, string> = {
  'koç': 'Aries', 'boğa': 'Taurus', 'ikizler': 'Gemini',
  'yengeç': 'Cancer', 'aslan': 'Leo', 'başak': 'Virgo',
  'terazi': 'Libra', 'akrep': 'Scorpio', 'yay': 'Sagittarius',
  'oğlak': 'Capricorn', 'kova': 'Aquarius', 'balık': 'Pisces',
  // ASCII variants
  'koc': 'Aries', 'boga': 'Taurus', 'yengec': 'Cancer',
  'basak': 'Virgo', 'oglak': 'Capricorn', 'balik': 'Pisces',
};

export function getZodiacInfo(burcName: string): ZodiacInfo | null {
  // Try direct English key
  if (ZODIAC_DATA[burcName]) return ZODIAC_DATA[burcName];
  // Try Turkish name lookup (case-insensitive)
  const key = TR_TO_EN[burcName.toLowerCase()];
  return key ? ZODIAC_DATA[key] : null;
}

type ElementCompatibility = 'harmonious' | 'neutral' | 'challenging';

const ELEMENT_COMPAT: Record<string, ElementCompatibility> = {
  'fire-fire': 'harmonious', 'fire-air': 'harmonious', 'fire-earth': 'challenging', 'fire-water': 'challenging',
  'earth-earth': 'harmonious', 'earth-water': 'harmonious', 'earth-air': 'challenging',
  'air-air': 'harmonious', 'air-water': 'challenging',
  'water-water': 'harmonious',
};

export function getElementCompatibility(e1: string, e2: string): { level: ElementCompatibility; description: string } {
  const key1 = `${e1}-${e2}`;
  const key2 = `${e2}-${e1}`;
  const level = ELEMENT_COMPAT[key1] || ELEMENT_COMPAT[key2] || 'neutral';

  const desc: Record<ElementCompatibility, string> = {
    harmonious: 'Uyumlu — doğal bir anlayış ve akış var',
    neutral: 'Nötr — farklı ama tamamlayıcı enerjiler',
    challenging: 'Zorlayıcı — farklı yaklaşımlar çatışma yaratabilir ama büyüme fırsatı sunar',
  };

  return { level, description: desc[level] };
}

export function getModalityCompatibility(m1: string, m2: string): string {
  if (m1 === m2) return 'Aynı modalite — benzer yaklaşım tarzı ama liderlik çatışması olabilir';
  const pair = [m1, m2].sort().join('-');
  const map: Record<string, string> = {
    'cardinal-fixed': 'Kardinal-Sabit — biri başlatır, diğeri sürdürür',
    'cardinal-mutable': 'Kardinal-Değişken — biri yönlendirir, diğeri uyum sağlar',
    'fixed-mutable': 'Sabit-Değişken — biri istikrar sağlar, diğeri esneklik katar',
  };
  return map[pair] || '';
}
