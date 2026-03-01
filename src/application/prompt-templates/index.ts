import type { PromptPair } from '@/domain/entities/prompt-pair';
import { DERIN_FORMAT, ANTI_INJECTION, langInstr, sanitizeInput, wrapUserData } from '@/lib/openai/prompts';

// ── Burç ──
export function burcCustomPrompt(customPrompt: string, lang?: string): PromptPair {
  const li = langInstr(lang);
  return {
    systemPrompt: `Sen astroloji danışmanısın. Profesyonel Türkçe yorumlar yaparsın.${ANTI_INJECTION}`,
    userPrompt: `Aşağıdaki konuda astroloji yorumu yap:\n${wrapUserData('soru', customPrompt)}${DERIN_FORMAT}${li}`,
    maxTokens: 800,
  };
}

export function burcMainPrompt(profilText: string, astroNot: string, crossContext?: string, lang?: string): PromptPair {
  const li = langInstr(lang);
  return {
    systemPrompt: `Sen astroloji danışmanısın. Verilen natal harita ve gezegen pozisyonlarına dayanarak yorum yap. "ihtimal/yönelim" dilini kullan.${ANTI_INJECTION}`,
    userPrompt: `Profil bilgilerine göre kişisel burç analizi yap.\n\nProfil:\n${profilText}${astroNot}${crossContext || ''}${DERIN_FORMAT}${li}`,
    maxTokens: 900,
  };
}

// ── Günlük ──
export function gunlukPrompt(
  tarihStr: string, burc: string, odakAd: string, odak: string,
  gokyuzu: string, transitNot: string, profilNot: string,
  crossContext?: string, lang?: string,
): PromptPair {
  const li = langInstr(lang);
  return {
    systemPrompt: `Sen günlük astroloji danışmanısın. Kısa, enerjik yorumlar yazarsın. Gerçek gezegen pozisyonlarına ve kişisel transitlere dayanarak yorum yap. Profil varsa kişiselleştir.${ANTI_INJECTION}`,
    userPrompt: `${tarihStr} — ${burc} günlük yorum. Odak: ${odakAd}.

Gökyüzü durumu:
${gokyuzu}${transitNot}
${profilNot}
## Bugünün Enerjisi
## ${odak === 'genel' ? 'Öne Çıkanlar' : odakAd.charAt(0).toUpperCase() + odakAd.slice(1)}
## Dikkat
## Günün Mesajı${crossContext || ''}${li}`,
    maxTokens: 700,
  };
}

// ── Tarot ──
export function tarotPrompt(cardDescriptions: string, astroCtx: string, profilText: string | null, crossContext?: string, lang?: string): PromptPair {
  const li = langInstr(lang);
  if (lang === 'en') {
    return {
      systemPrompt: `You are a tarot reader. Provide intuitive, empathetic readings. Consider astrological correspondences and Moon phase. Use markdown.${ANTI_INJECTION}`,
      userPrompt: `3-card spread:\n${cardDescriptions}\n\nAstrological Context:\n${astroCtx}${profilText ? `\n\nProfile:\n${profilText}` : ''}${crossContext || ''}\n\n## Summary\n## Past\n## Present\n## Future\n## Synthesis${li}`,
      maxTokens: 800,
    };
  }
  return {
    systemPrompt: `Sen tarot okuyucususun. Sezgisel ve empatik yorumlar yaparsın. Kartların astrolojik karşılıklarını ve günün Ay fazını dikkate al. Markdown kullan.${ANTI_INJECTION}`,
    userPrompt: `3 kartlık tarot açılımı:\n${cardDescriptions}\n\nAstrolojik Bağlam:\n${astroCtx}${profilText ? `\n\nProfil:\n${profilText}` : ''}${crossContext || ''}\n\n## Özet\n## Geçmiş Kartı\n## Şimdi Kartı\n## Gelecek Kartı\n## Sentez${li}`,
    maxTokens: 800,
  };
}

// ── Horary ──
const HORARY_SYSTEM = `Sen horary astroloji uzmanısın. Klasik horary geleneğini bilirsin ama günlük dilde, sıcak ve samimi anlatırsın.

Teknik İngilizce terim KULLANMA. Türkçe günlük dilde anlat. Kısa cümleler kur, her bölümü 3-5 cümleyle özetle. "Kesin olacak" deme; yumuşak ifadeler kullan.`;

export function horaryPrompt(
  soru: string, konuAd: string, sureAd: string,
  horaryCtx: string, profilText: string, uzmanUyari: string,
  now: Date, lang?: string,
): PromptPair {
  const li = langInstr(lang);
  return {
    systemPrompt: `${HORARY_SYSTEM}${ANTI_INJECTION}`,
    userPrompt: `Soru: ${wrapUserData('soru', soru)}
Konu: ${sanitizeInput(konuAd)} | Süre: ${sanitizeInput(sureAd)} | Zaman: ${now.toISOString()}

${horaryCtx}

Profil:\n${profilText}

## Özet
## Gökyüzü Ne Diyor?
## Lehine / Aleyhine Enerjiler
## Zamanlama
## Ne Yapmalısın?${uzmanUyari}${li}`,
    maxTokens: 1000,
  };
}

// ── Uyum ──
export function uyumPrompt(burc1: string, burc2: string, iliskiAd: string, uyumVeri: string, gokyuzu: string, profilNot: string, crossContext?: string, lang?: string): PromptPair {
  const li = langInstr(lang);
  return {
    systemPrompt: `Sen sinastri (ilişki astrolojisi) danışmanısın. Verilen element/modalite uyum verisini ve gökyüzü durumunu dikkate alarak yorum yap.${ANTI_INJECTION}`,
    userPrompt: `${burc1} — ${burc2} ${iliskiAd} uyumu.${uyumVeri}

Günün Gökyüzü:
${gokyuzu}
${profilNot}\n\n## Uyum Skoru\n## Güçlü Yönler\n## Zorluklar\n## Tavsiye${crossContext || ''}${li}`,
    maxTokens: 900,
  };
}

// ── Palm ──
export function palmPrompt(profilText: string, elementNot: string, lang?: string): PromptPair {
  const li = langInstr(lang);
  return {
    systemPrompt: `Palmistry uzmanısın. Sembolik/eğlence amaçlıdır.${ANTI_INJECTION}`,
    userPrompt: `Elin çizgilerini ve yapısını analiz et.\n\nProfil:\n${profilText}${elementNot}\n\nYaşam, kalp, akıl çizgisi ve el şeklini değerlendir. "ihtimal/yönelim" dilini kullan.${DERIN_FORMAT}${li}`,
    maxTokens: 800,
  };
}

// ── Dream ──
export function dreamPrompt(metin: string, ayCtx: string, profilText: string, lang?: string): PromptPair {
  const li = langInstr(lang);
  return {
    systemPrompt: `Sen rüya analizi uzmanısın. Jungian ve arketipsel yorumlama yaparsın. Ay fazı ve burcu rüya yorumunu etkileyebilir — bu veriyi dikkate al. Sadece analiz et, soru sorma.${ANTI_INJECTION}`,
    userPrompt: `Rüya metni: ${wrapUserData('ruya', metin)}\n\nAstrolojik Bağlam:\n${ayCtx}\n\nProfil:\n${profilText}\n\nBaskın duyguyu, bağlantılı yaşam alanını ve mesajı tespit et.${DERIN_FORMAT}${li}`,
    maxTokens: 800,
  };
}

// ── Numerology ──
export function numerologyPrompt(
  numbers: { yasamYolu: number; kader: number; ruhArzu: number; kisilik: number },
  ad: string, tarih: string | undefined, profilNot: string,
  crossContext?: string, lang?: string,
): PromptPair {
  const li = langInstr(lang);
  return {
    systemPrompt: `Sen numeroloji danışmanısın. "ihtimal/yönelim" dilini kullan.${ANTI_INJECTION}`,
    userPrompt: `Numeroloji matrisi:\nAd: ${wrapUserData('ad', ad)} | Tarih: ${tarih || '—'}\nYaşam Yolu: ${numbers.yasamYolu} | Kader: ${numbers.kader} | Ruh: ${numbers.ruhArzu} | Kişilik: ${numbers.kisilik}${profilNot}\n\nSayıları yorumla, varsa burç bağlantısı kur.${crossContext || ''}${DERIN_FORMAT}${li}`,
    maxTokens: 800,
  };
}

// ── Cosmic ──
export function cosmicPrompt(profilText: string, tarih?: string, gun?: string, web_data?: string, lang?: string): PromptPair {
  const li = langInstr(lang);
  const gezegenBilgi = web_data
    ? `Güncel gezegen verileri:\n${web_data}`
    : '(Güncel gezegen verisi yok — genel astroloji kurallarıyla yorumla.)';
  return {
    systemPrompt: `Sen astroloji danışmanısın. "ihtimal/yönelim" dilini kullan.${ANTI_INJECTION}`,
    userPrompt: `Tarih: ${tarih || 'bugün'} (${gun || '—'})\n${gezegenBilgi}\n\nProfil:\n${profilText}\n\nAşk, para, kariyer ve ruhsal alanları değerlendir. Retro/tutulma varsa vurgula.${DERIN_FORMAT}${li}`,
    maxTokens: 800,
  };
}

// ── Lunar ──
export function lunarPrompt(
  date: string | undefined, phase: string | undefined, moonSign: string | undefined,
  illumination: number | undefined, profilText: string, lang?: string,
): PromptPair {
  const li = langInstr(lang);
  return {
    systemPrompt: `Sen ay fazı danışmanısın. Ay evreleri ve burç geçişlerinin yaşama etkisini yorumlarsın.${ANTI_INJECTION}`,
    userPrompt: `${date || 'bugün'} — ${phase || '?'} | Ay Burcu: ${moonSign || '?'} | %${illumination ?? 0}\n\nProfil:\n${profilText}\n\n## Ay Enerjisi\n## Kişisel Etki\n## Ritüel Önerisi\n## Dikkat${li}`,
    maxTokens: 700,
  };
}

// ── Rising ──
export function risingPrompt(profilText: string, calcNote: string, eminlikNot: string, lang?: string): PromptPair {
  const li = langInstr(lang);
  const signInstruction = calcNote
    ? `\n\nÖNEMLİ: Yanıtının ilk satırı SADECE hesaplanan burç adı olsun, büyük başlık olarak. Örnek:\n# Yengeç\nSonra analizi yaz.`
    : `\n\nÖNEMLİ: Yanıtının ilk satırı SADECE en güçlü olasılık olan burç adı olsun, büyük başlık olarak. Örnek:\n# Yengeç\nSonra analizi yaz.`;
  return {
    systemPrompt: `Sen astroloji danışmanısın. "ihtimal/yönelim" dilini kullan.${ANTI_INJECTION}`,
    userPrompt: `Yükselen burcu analizi.${calcNote}\n\nProfil:\n${profilText}${eminlikNot}\n\nDoğum saati/yeri eksikse kesin hesaplama yapılamadığını belirt.${signInstruction}${DERIN_FORMAT}${li}`,
    maxTokens: 700,
  };
}

// ── Moon Sign ──
export function moonSignPrompt(profilText: string, calcNote: string, eminlikNot: string, lang?: string): PromptPair {
  const li = langInstr(lang);
  const signInstruction = calcNote
    ? `\n\nÖNEMLİ: Yanıtının ilk satırı SADECE hesaplanan burç adı olsun, büyük başlık olarak. Örnek:\n# Yengeç\nSonra analizi yaz.`
    : `\n\nÖNEMLİ: Yanıtının ilk satırı SADECE en güçlü olasılık olan burç adı olsun, büyük başlık olarak. Örnek:\n# Yengeç\nSonra analizi yaz.`;
  return {
    systemPrompt: `Sen astroloji danışmanısın. Ay burcu duygusal dünyayı temsil eder. "ihtimal/yönelim" dilini kullan.${ANTI_INJECTION}`,
    userPrompt: `Ay burcu analizi.${calcNote}\n\nProfil:\n${profilText}${eminlikNot}\n\nDoğum tarihi eksikse kesin hesaplama yapılamadığını belirt.${signInstruction}${DERIN_FORMAT}${li}`,
    maxTokens: 700,
  };
}

// ── Daily Content ──
export function dailyContentGununKartiPrompt(
  cardInfo: { card: string; icon: string }, planetTr: string,
  planetSign: string, planetDeg: string, retroSymbol: string,
  dateStr: string, burc: string, profilText: string | null, lang?: string,
): PromptPair {
  const li = langInstr(lang);
  return {
    systemPrompt: `Sen kozmik kart yorumcususun. Profil varsa kişiselleştir.${ANTI_INJECTION}`,
    userPrompt: `${cardInfo.card} ${cardInfo.icon} | ${planetTr} (${planetSign} ${planetDeg}${retroSymbol})
${dateStr}${burc ? ` | ${burc}` : ''}${profilText ? `\nProfil:\n${profilText}` : ''}

## ${cardInfo.icon} ${cardInfo.card}
## Bugünün Mesajı
## Tavsiye${li}`,
    maxTokens: 400,
  };
}

export function dailyContentHaftalikPrompt(burc: string, dateStr: string, profilText: string | null, lang?: string): PromptPair {
  const li = langInstr(lang);
  return {
    systemPrompt: `Sen haftalık astroloji yorumcususun. Profil varsa kişiselleştir.${ANTI_INJECTION}`,
    userPrompt: `${burc || 'genel'} haftalık — ${dateStr} haftası${profilText ? `\nProfil:\n${profilText}` : ''}

## Haftanın Enerjisi
## Güçlü Günler
## Dikkat Günleri
## Odak Alanı
## Mesaj${li}`,
    maxTokens: 600,
  };
}

export function dailyContentAylikPrompt(burc: string, monthName: string, profilText: string | null, lang?: string): PromptPair {
  const li = langInstr(lang);
  return {
    systemPrompt: `Sen aylık astroloji yorumcususun. Profil varsa kişiselleştir.${ANTI_INJECTION}`,
    userPrompt: `${burc || 'genel'} — ${monthName} aylık tahmin.${profilText ? `\nProfil:\n${profilText}` : ''}

## Genel Enerji
## Kariyer & Para
## Aşk & İlişkiler
## Sağlık
## Önemli Tarihler
## Tavsiye${li}`,
    maxTokens: 700,
  };
}

// ── Ritual ──
export function ritualPrompt(
  moonPhaseName: string, moonEmoji: string, illumination: number,
  moonSign: string, dayRulerTR: string, rulerSign: string, rulerDeg: string,
  retroSymbol: string, dateStr: string, profilText: string, lang?: string,
): PromptPair {
  const li = langInstr(lang);
  return {
    systemPrompt: `Sen kozmik ritüel danışmanısın. Ay fazları ve gezegen enerjilerine göre ritüel oluşturursun.${ANTI_INJECTION}`,
    userPrompt: `${moonPhaseName} ${moonEmoji} (%${illumination}) | Ay: ${moonSign} | ${dayRulerTR} (${rulerSign} ${rulerDeg}${retroSymbol})
${dateStr}

Profil:\n${profilText}

## Sabah Afirmasyonu
## Günün Kristali & Rengi
## Ritüel Önerisi
## Akşam Yansıması${li}`,
    maxTokens: 600,
  };
}
