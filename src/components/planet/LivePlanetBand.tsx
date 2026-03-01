'use client';

import { useState, useEffect, useRef } from 'react';
import * as Astronomy from 'astronomy-engine';

interface PlanetInfo {
  name: string;
  icon: string;
  sign: string;
  signIcon: string;
  retrograde: boolean;
}

// Her gezegenin astrolojik olarak neyi temsil ettiği
const PLANET_DESCRIPTIONS: Record<string, string> = {
  'Ay': 'Ay, duygularınızı, iç dünyanızı, sezgilerinizi ve bilinçaltı tepkilerinizi yönetir. Bulunduğu burç, o gün duygusal olarak nasıl hissedeceğinizi etkiler.',
  'Güneş': 'Güneş, kimliğinizi, yaşam enerjinizi ve benlik bilincinizi temsil eder. Bulunduğu burç, genel enerji akışını ve odak noktanızı belirler.',
  'Mars': 'Mars, eylem gücünüzü, motivasyonunuzu, cesaretinizi ve fiziksel enerjinizi yönetir. Bulunduğu burç, nasıl harekete geçtiğinizi etkiler.',
  'Merkür': 'Merkür, iletişimi, düşünce yapınızı, öğrenmeyi ve bilgi alışverişini yönetir. Bulunduğu burç, nasıl düşündüğünüzü ve konuştuğunuzu etkiler.',
};

const PLANET_SIGN_MEANINGS: Record<string, Record<string, string>> = {
  'Güneş': {
    'Koç': 'Enerjik ve lider ruhlu bir dönem. Yeni başlangıçlar için güçlü bir zaman.',
    'Boğa': 'Kararlılık ve maddi konular ön planda. Sabır ve istikrar dönemi.',
    'İkizler': 'İletişim ve sosyal aktiviteler güçlü. Merak ve öğrenme isteği artıyor.',
    'Yengeç': 'Duygusal derinlik ve aile odağı. Ev ve güvenlik konuları önemli.',
    'Aslan': 'Yaratıcılık ve özgüven dorukta. Kendinizi ifade etme zamanı.',
    'Başak': 'Detaylara dikkat ve sağlık bilinci. Düzenleme ve iyileştirme dönemi.',
    'Terazi': 'İlişkiler ve denge arayışı. Adalet ve uyum ön planda.',
    'Akrep': 'Dönüşüm ve derinlere iniş zamanı. Gizli gerçekler yüzeye çıkabilir.',
    'Yay': 'Özgürlük ve keşif arzusu yüksek. Ufkunu genişletme zamanı.',
    'Oğlak': 'Disiplin ve kariyer odaklı dönem. Uzun vadeli hedefler için çalışma zamanı.',
    'Kova': 'Yenilikçi fikirler ve toplumsal bilinç. Alışılmadık çözümler bulma dönemi.',
    'Balık': 'Sezgiler güçlü, hayal gücü yoğun. Ruhsal derinleşme zamanı.',
  },
  'Ay': {
    'Koç': 'Duygusal tepkiler hızlı ve anlık. Sabırsızlık hissedebilirsiniz ama cesaret de yüksek.',
    'Boğa': 'Duygusal güvenlik ve konfor arayışı. Huzur veren aktiviteler iyi gelir.',
    'İkizler': 'Zihinsel hareketlilik ve merak. Sosyalleşme ihtiyacı artıyor.',
    'Yengeç': 'Duyguların en derin hali. Sezgiler çok güçlü, aileye yakınlık hissi artıyor.',
    'Aslan': 'Duygusal ifade ve yaratıcılık iç içe. İlgi ve takdir görme ihtiyacı yüksek.',
    'Başak': 'Duygularda düzen ve analiz ihtiyacı. Küçük detaylar bile duygu durumunu etkiler.',
    'Terazi': 'Uyum arayışı ve ilişki odağı. Çatışmalardan kaçınma eğilimi güçlü.',
    'Akrep': 'Yoğun duygular ve dönüşüm enerjisi. Derin bağlar kurmak isteyebilirsiniz.',
    'Yay': 'Duygusal özgürlük ve iyimserlik. Macera ve yeni deneyimler iyi gelir.',
    'Oğlak': 'Duygularda kontrol ve sorumluluk. Ciddi konulara odaklanma eğilimi.',
    'Kova': 'Bağımsız duygusal yaklaşım. Farklı bakış açıları keşfetmek isteyebilirsiniz.',
    'Balık': 'Empati ve ruhsal hassasiyet dorukta. Sanat ve müzik iyi gelir.',
  },
  'Merkür': {
    'Koç': 'Düşünceler hızlı, iletişim direkt. Fikirlerinizi cesurca paylaşabilirsiniz.',
    'Boğa': 'Pratik düşünme, yavaş ama sağlam kararlar. Aceleden kaçının.',
    'İkizler': 'Zihinsel çeviklik ve çok yönlü iletişim. Öğrenme kapasitesi çok yüksek.',
    'Yengeç': 'Duygusal zeka ile düşünme. Sezgilerinize güvenebilirsiniz.',
    'Aslan': 'Yaratıcı fikirler ve dramatik ifade. Sunumlar ve konuşmalar için iyi bir dönem.',
    'Başak': 'Analitik düşünme gücü en yüksek. Detaylı çalışmalar için ideal zaman.',
    'Terazi': 'Diplomatik iletişim ve denge arayışı. Müzakere yeteneği güçlü.',
    'Akrep': 'Derin araştırma ve gizlileri çözme. Stratejik düşünme yeteneği artıyor.',
    'Yay': 'Geniş perspektif ve felsefi düşünce. Büyük resmi görmek kolaylaşıyor.',
    'Oğlak': 'Yapısal düşünme ve planlı iletişim. İş toplantıları için verimli dönem.',
    'Kova': 'Yenilikçi fikirler ve orijinal düşünceler. Yaratıcı çözümler bulabilirsiniz.',
    'Balık': 'Sezgisel iletişim ve hayal gücü. Sanatsal ifade için güçlü bir dönem.',
  },
  'Mars': {
    'Koç': 'Enerji ve motivasyon zirve seviyede. Yeni projelere başlamak için harika bir zaman.',
    'Boğa': 'Azimli ve kararlı bir enerji akışı. Başladığınız işleri bitirme gücünüz yüksek.',
    'İkizler': 'Enerji dağınık ama çok yönlü. Birden fazla konuya aynı anda odaklanabilirsiniz.',
    'Yengeç': 'Duygusal motivasyon ve savunmacı enerji. Sevdikleriniz için mücadele gücünüz yüksek.',
    'Aslan': 'Yaratıcı güç ve cesaret yüksek. Liderlik ve inisiyatif alma zamanı.',
    'Başak': 'Disiplinli ve metodlu çalışma enerjisi. Verimlilik en üst düzeyde.',
    'Terazi': 'Enerji dengeye yönelir. İşbirliği ve ortak projeler için uygun dönem.',
    'Akrep': 'Yoğun irade gücü ve dönüştürücü enerji. Büyük dönüşümler mümkün.',
    'Yay': 'Macera ruhu ve fiziksel enerji bol. Spor ve açık hava aktiviteleri için ideal.',
    'Oğlak': 'Stratejik ve hedefe odaklı güç. Kariyer hedeflerine doğru güçlü adımlar.',
    'Kova': 'Reform enerjisi ve kolektif hareket. Toplumsal projeler için motivasyon yüksek.',
    'Balık': 'Sezgisel hareket ve şefkatli güç. Yardımseverlik ve empati enerjisi güçlü.',
  },
};

const SIGNS = ['Koç','Boğa','İkizler','Yengeç','Aslan','Başak','Terazi','Akrep','Yay','Oğlak','Kova','Balık'];
const SIGN_ICONS: Record<string, string> = {
  'Koç': '♈', 'Boğa': '♉', 'İkizler': '♊', 'Yengeç': '♋',
  'Aslan': '♌', 'Başak': '♍', 'Terazi': '♎', 'Akrep': '♏',
  'Yay': '♐', 'Oğlak': '♑', 'Kova': '♒', 'Balık': '♓',
};

function lonToSign(lon: number): string {
  const n = ((lon % 360) + 360) % 360;
  const idx = Math.floor(n / 30) % 12;
  return SIGNS[idx];
}

function getBodyLongitude(body: string, date: Date): number {
  if (body === 'Sun') {
    const sun = Astronomy.SunPosition(date);
    return sun.elon;
  }
  if (body === 'Moon') {
    const moon = Astronomy.EclipticGeoMoon(date);
    return moon.lon;
  }
  const observer = new Astronomy.Observer(0, 0, 0);
  const eq = Astronomy.Equator(body as Astronomy.Body, date, observer, true, true);
  const ecl = Astronomy.Ecliptic(eq.vec);
  return ecl.elon;
}

function isRetrograde(body: string, date: Date): boolean {
  const msPerDay = 86400000;
  const before = new Date(date.getTime() - msPerDay);
  const after = new Date(date.getTime() + msPerDay);
  const lonBefore = getBodyLongitude(body, before);
  const lonAfter = getBodyLongitude(body, after);
  let diff = lonAfter - lonBefore;
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;
  return diff < 0;
}

function computePlanets(date: Date): PlanetInfo[] {
  const bodies = [
    { body: 'Moon', name: 'Ay', icon: '🌙' },
    { body: 'Sun', name: 'Güneş', icon: '☀️' },
    { body: 'Mars', name: 'Mars', icon: '♂️' },
    { body: 'Mercury', name: 'Merkür', icon: '☿' },
  ];

  return bodies.map(({ body, name, icon }) => {
    const lon = getBodyLongitude(body, date);
    const sign = lonToSign(lon);
    const retrograde = body !== 'Sun' && body !== 'Moon' ? isRetrograde(body, date) : false;
    return {
      name,
      icon,
      sign,
      signIcon: SIGN_ICONS[sign] || '',
      retrograde,
    };
  });
}

interface LivePlanetBandProps {
  t: (key: string) => string;
  lang: string;
}

export function LivePlanetBand({ t, lang }: LivePlanetBandProps) {
  const [planets, setPlanets] = useState<PlanetInfo[] | null>(null);
  const [dateStr, setDateStr] = useState('');
  const [showInfo, setShowInfo] = useState(false);
  const infoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const now = new Date();
    setDateStr(now.toLocaleDateString(lang === 'en' ? 'en-US' : 'tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }));
    try {
      const result = computePlanets(now);
      setPlanets(result);
    } catch {
      // Fallback: no data
    }
  }, [lang]);

  // Close info panel on outside click
  useEffect(() => {
    if (!showInfo) return;
    function handleClick(e: MouseEvent) {
      if (infoRef.current && !infoRef.current.contains(e.target as Node)) {
        setShowInfo(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showInfo]);

  if (!planets) return null;

  const mercury = planets.find((p) => p.name === 'Merkür');
  const hasRetrograde = planets.some((p) => p.retrograde);

  return (
    <div data-tour="planet-band" className="sticky top-0 z-50 border-b border-border/40 bg-bg/90 backdrop-blur-xl" ref={infoRef}>
      <div className="mx-auto max-w-5xl px-4">
        <div className="flex items-center gap-1 overflow-x-auto py-2 scrollbar-hide">
          {/* Date */}
          <span className="shrink-0 text-xs text-muted mr-2">
            📅 {dateStr}
          </span>

          <span className="shrink-0 w-px h-4 bg-border/60" />

          {/* Planets */}
          {planets.map((p) => (
            <div
              key={p.name}
              className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs"
            >
              <span>{p.icon}</span>
              <span className="text-muted">{p.name}</span>
              <span className="font-medium text-text">{p.signIcon} {p.sign}</span>
              {p.retrograde && (
                <span className="text-[10px] text-red-400 font-semibold ml-0.5">℞</span>
              )}
            </div>
          ))}

          <span className="shrink-0 w-px h-4 bg-border/60" />

          {/* Mercury Status */}
          {mercury && (
            <div className={`shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
              mercury.retrograde
                ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                : 'bg-green-500/10 text-green-400 border border-green-500/20'
            }`}>
              <span>{mercury.retrograde ? '↩️' : '▶️'}</span>
              <span>{mercury.retrograde ? t('merkur_retro') : t('merkur_duz')}</span>
            </div>
          )}

          <span className="shrink-0 w-px h-4 bg-border/60" />

          {/* Info Button */}
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent/10 hover:bg-accent/20 text-accent transition-colors text-[11px] font-medium whitespace-nowrap border border-accent/20"
            aria-label={lang === 'en' ? 'Planet info' : 'Gezegen bilgisi'}
          >
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{lang === 'en' ? 'What does this mean?' : 'Bu ne anlama geliyor?'}</span>
          </button>
        </div>
      </div>

      {/* Info Panel — rendered outside the overflow container */}
      {showInfo && (
        <div className="absolute left-0 right-0 top-full z-[60] animate-[fadeIn_0.2s_ease-out]">
          <div className="mx-auto max-w-5xl px-4">
            <div className="ml-auto w-full sm:w-96 max-h-[70vh] overflow-y-auto rounded-b-xl border border-t-0 border-border bg-surface shadow-2xl">
              <div className="p-4 space-y-4">
                {/* Retro Explanation */}
                {hasRetrograde && (
                  <div className="space-y-1.5">
                    <h4 className="text-sm font-semibold text-red-400 flex items-center gap-1.5">
                      <span>℞</span>
                      {lang === 'en' ? 'What is Retrograde?' : 'Retro Ne Demek?'}
                    </h4>
                    <p className="text-xs text-muted leading-relaxed">
                      {lang === 'en'
                        ? 'When a planet is retrograde (℞), it appears to move backward in the sky from Earth\'s perspective. This doesn\'t mean the planet actually reverses — it\'s an optical illusion caused by orbital speeds. Retrograde periods are associated with delays, revisions, and introspection in the areas that planet governs.'
                        : 'Bir gezegen retro (℞) olduğunda, Dünya\'dan bakıldığında gökyüzünde geriye doğru hareket ediyormuş gibi görünür. Gezegen gerçekten geri gitmez — bu yörünge hızlarından kaynaklanan bir optik yanılsamadır. Retro dönemleri, o gezegenin yönettiği alanlarda gecikmeler, geri dönüşler ve içe bakış ile ilişkilendirilir.'}
                    </p>
                  </div>
                )}

                {/* Always show retro explanation even when no planet is retro */}
                {!hasRetrograde && (
                  <div className="space-y-1.5">
                    <h4 className="text-sm font-semibold text-green-400 flex items-center gap-1.5">
                      <span>℞</span>
                      {lang === 'en' ? 'What is Retrograde?' : 'Retro Ne Demek?'}
                    </h4>
                    <p className="text-xs text-muted leading-relaxed">
                      {lang === 'en'
                        ? 'Retrograde (℞) is when a planet appears to move backward from Earth\'s view. Currently no planets shown here are retrograde — a good time for forward momentum!'
                        : 'Retro (℞), bir gezegenin Dünya\'dan bakıldığında geriye doğru hareket ediyormuş gibi görünmesidir. Şu anda burada gösterilen hiçbir gezegen retro değil — ileri adımlar için iyi bir dönem!'}
                    </p>
                  </div>
                )}

                {/* Planet Meanings */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-text">
                    {lang === 'en' ? 'Current Positions' : 'Güncel Gezegen Konumları'}
                  </h4>
                  {planets.map((p) => {
                    const meaning = PLANET_SIGN_MEANINGS[p.name]?.[p.sign];
                    const description = PLANET_DESCRIPTIONS[p.name];
                    return (
                      <div key={p.name} className={`rounded-xl p-3 space-y-2 ${p.retrograde ? 'bg-red-500/5 border border-red-500/10' : 'bg-card/40 border border-border/30'}`}>
                        {/* Planet header */}
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{p.icon}</span>
                          <span className="text-sm font-bold text-text">{p.name}</span>
                          <span className="text-sm text-accent-light font-medium">{p.signIcon} {p.sign}</span>
                          {p.retrograde && (
                            <span className="text-[10px] bg-red-500/15 text-red-400 px-1.5 py-0.5 rounded-full font-semibold">℞ RETRO</span>
                          )}
                        </div>
                        {/* What this planet represents */}
                        {description && (
                          <p className="text-[11px] text-muted/80 leading-relaxed pl-8 italic">{description}</p>
                        )}
                        {/* What the current sign means */}
                        {meaning && (
                          <div className="pl-8">
                            <p className="text-[11px] font-medium text-accent/80 mb-0.5">
                              {p.name} {p.sign} burcunda:
                            </p>
                            <p className="text-xs text-text/80 leading-relaxed">{meaning}</p>
                          </div>
                        )}
                        {/* Retro warning */}
                        {p.retrograde && (
                          <div className="pl-8 pt-1 border-t border-red-500/10">
                            <p className="text-[11px] text-red-400/80 leading-relaxed flex items-start gap-1.5">
                              <span className="shrink-0 mt-0.5">⚠️</span>
                              <span>
                                {p.name === 'Merkür'
                                  ? 'Merkür retrosu iletişim, teknoloji ve seyahatleri olumsuz etkiler. Sözleşme imzalamaktan, önemli kararlar almaktan ve yeni elektronik cihaz almaktan kaçının. Eski arkadaşlar ve bitmemiş işler geri dönebilir.'
                                  : p.name === 'Mars'
                                    ? 'Mars retrosu enerji seviyenizi düşürebilir. Aceleci kararlardan ve gereksiz tartışmalardan kaçının. İçsel motivasyonunuzu yeniden keşfetmek için iyi bir dönem.'
                                    : 'Bu gezegenin enerjisi retro döneminde içe döner. İlgili konularda yavaşlama ve yeniden değerlendirme yaşanabilir.'}
                              </span>
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Close button */}
                <button
                  onClick={() => setShowInfo(false)}
                  className="w-full py-2 text-xs text-muted hover:text-text transition-colors"
                >
                  {lang === 'en' ? 'Close' : 'Kapat'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
