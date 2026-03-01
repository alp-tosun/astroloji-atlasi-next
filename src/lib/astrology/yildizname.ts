/**
 * Yıldızname (Ebced) Hesaplama Kütüphanesi
 *
 * Türk-İslam geleneğinde Ebced (Abjad) değeri ile yıldız okuması yapar.
 * Harflerin sayısal karşılıkları İslam astroloji geleneğinden alınmıştır.
 */

// Ebced harf-sayı eşleştirmesi (Osmanlı-Türk alfabesi uyumlu)
// Her harf hem büyük hem küçük olarak eşleştirilir
const EBCED_MAP: Record<string, number> = {
  // Elif-Ba sırası (Osmanlı/Arap harfleri Türkçe karşılıkları)
  'a': 1, 'b': 2, 'c': 3, 'ç': 4, 'd': 5,
  'e': 6, 'f': 7, 'g': 8, 'ğ': 9, 'h': 10,
  'ı': 11, 'i': 12, 'j': 13, 'k': 14, 'l': 15,
  'm': 16, 'n': 17, 'o': 18, 'ö': 19, 'p': 20,
  'r': 21, 's': 22, 'ş': 23, 't': 24, 'u': 25,
  'ü': 26, 'v': 27, 'y': 28, 'z': 29,
};

// Geleneksel Ebced büyük değer tablosu (Arap harfleri karşılıkları)
const EBCED_BUYUK: Record<string, number> = {
  'a': 1, 'b': 2, 'c': 3, 'd': 4, 'e': 5,
  'f': 80, 'g': 3, 'ğ': 1000, 'h': 8, 'ı': 10,
  'i': 10, 'j': 3, 'k': 20, 'l': 30, 'm': 40,
  'n': 50, 'o': 70, 'ö': 70, 'p': 2, 'r': 200,
  's': 60, 'ş': 300, 't': 400, 'u': 6, 'ü': 6,
  'v': 6, 'y': 10, 'z': 7, 'ç': 3,
};

// 7 gezegen yönetici (mod 7 sırasına göre)
const GEZEGEN_YONETICI = [
  { name: 'Güneş', planet: 'Sun', icon: '☀️' },
  { name: 'Ay', planet: 'Moon', icon: '🌙' },
  { name: 'Mars', planet: 'Mars', icon: '♂️' },
  { name: 'Merkür', planet: 'Mercury', icon: '☿️' },
  { name: 'Jüpiter', planet: 'Jupiter', icon: '♃' },
  { name: 'Venüs', planet: 'Venus', icon: '♀️' },
  { name: 'Satürn', planet: 'Saturn', icon: '♄' },
];

// 12 burç karşılığı (mod 12)
const BURC_KARSILIGI = [
  'Koç', 'Boğa', 'İkizler', 'Yengeç', 'Aslan', 'Başak',
  'Terazi', 'Akrep', 'Yay', 'Oğlak', 'Kova', 'Balık',
];

// 4 element
const ELEMENTLER = ['Ateş', 'Toprak', 'Hava', 'Su'];

// Tabiat (mizaç)
const TABIATLAR = [
  { sicaklik: 'Sıcak', nem: 'Kuru', ad: 'Safra (Ateş)' },   // 0
  { sicaklik: 'Soğuk', nem: 'Kuru', ad: 'Sevda (Toprak)' },  // 1
  { sicaklik: 'Sıcak', nem: 'Nemli', ad: 'Dem (Hava)' },     // 2
  { sicaklik: 'Soğuk', nem: 'Nemli', ad: 'Balgam (Su)' },    // 3
];

// Uğurlu günler, renkler, taşlar (gezegene göre)
const UGURLU_VERI: Record<number, { gun: string; renk: string; sayi: number; tas: string }> = {
  0: { gun: 'Pazar', renk: 'Altın / Sarı', sayi: 1, tas: 'Yakut' },
  1: { gun: 'Pazartesi', renk: 'Beyaz / Gümüş', sayi: 2, tas: 'İnci' },
  2: { gun: 'Salı', renk: 'Kırmızı', sayi: 9, tas: 'Mercan' },
  3: { gun: 'Çarşamba', renk: 'Yeşil', sayi: 5, tas: 'Zümrüt' },
  4: { gun: 'Perşembe', renk: 'Mor / Lacivert', sayi: 3, tas: 'Safir' },
  5: { gun: 'Cuma', renk: 'Pembe / Turkuaz', sayi: 6, tas: 'Elmas' },
  6: { gun: 'Cumartesi', renk: 'Siyah / Lacivert', sayi: 8, tas: 'Oniks' },
};

// Karakter özellikleri (gezegene göre)
const KARAKTER: Record<number, string> = {
  0: 'Lider, karizmatik, yaratıcı, bağımsız. Otorite ve güç alanlarında başarılı.',
  1: 'Sezgisel, duygusal, koruyucu, değişken. Sanat ve bakım alanlarında yetenekli.',
  2: 'Cesur, enerjik, rekabetçi, tutkulı. Spor ve askeri alanlarda öne çıkar.',
  3: 'Zeki, iletişimci, analitik, çok yönlü. Ticaret ve yazarlık alanlarında başarılı.',
  4: 'Bilge, adaletli, liderlik ruhu, iyimser. Eğitim ve din alanlarında saygın.',
  5: 'Zarif, uyumlu, estetik duyarlı, sevecen. Sanat ve diplomasi alanlarında yetenekli.',
  6: 'Disiplinli, sabırlı, ciddi, dayanıklı. Yapı ve yönetim alanlarında başarılı.',
};

/**
 * Geleneksel büyük ebced değeri hesapla.
 */
export function calculateAbjadValue(text: string): number {
  const normalized = text.toLowerCase().trim();
  let total = 0;
  for (const ch of normalized) {
    if (EBCED_BUYUK[ch] !== undefined) {
      total += EBCED_BUYUK[ch];
    }
  }
  return total;
}

/**
 * Basit Ebced değeri hesapla (1-29 arası sıralı).
 */
export function calculateSimpleAbjad(text: string): number {
  const normalized = text.toLowerCase().trim();
  let total = 0;
  for (const ch of normalized) {
    if (EBCED_MAP[ch] !== undefined) {
      total += EBCED_MAP[ch];
    }
  }
  return total;
}

export interface YildizNameResult {
  ad: string;
  anneAdi?: string;
  abjadTotal: number;
  simpleTotal: number;
  yildizSayisi: number;       // mod 12
  gezegenIndex: number;       // mod 7
  gezegenYonetici: typeof GEZEGEN_YONETICI[number];
  tabiat: typeof TABIATLAR[number];
  element: string;
  burcKarsiligi: string;
  ugurlu: typeof UGURLU_VERI[number];
  karakter: string;
}

/**
 * Tam yıldızname hesaplaması.
 */
export function calculateYildizname(
  ad: string,
  anneAdi?: string,
  dogumTarih?: string,
): YildizNameResult {
  // Ana hesaplama: ad + anne adı (geleneksel)
  const combinedText = anneAdi ? `${ad} ${anneAdi}` : ad;
  const abjadTotal = calculateAbjadValue(combinedText);
  const simpleTotal = calculateSimpleAbjad(combinedText);

  // Doğum tarihi katkısı (varsa)
  let dateBonus = 0;
  if (dogumTarih) {
    const d = new Date(dogumTarih);
    if (!isNaN(d.getTime())) {
      dateBonus = d.getDate() + (d.getMonth() + 1);
    }
  }

  const totalForCalc = abjadTotal + dateBonus;

  // Yıldız sayısı (0-11): mod 12
  const yildizSayisi = totalForCalc % 12;

  // Gezegen yönetici (0-6): mod 7
  const gezegenIndex = totalForCalc % 7;

  // Tabiat (0-3): mod 4
  const tabiatIndex = totalForCalc % 4;

  // Element (0-3): burcun elementine göre
  const elementIndex = yildizSayisi % 4;

  return {
    ad,
    anneAdi,
    abjadTotal,
    simpleTotal,
    yildizSayisi,
    gezegenIndex,
    gezegenYonetici: GEZEGEN_YONETICI[gezegenIndex],
    tabiat: TABIATLAR[tabiatIndex],
    element: ELEMENTLER[elementIndex],
    burcKarsiligi: BURC_KARSILIGI[yildizSayisi],
    ugurlu: UGURLU_VERI[gezegenIndex],
    karakter: KARAKTER[gezegenIndex],
  };
}
