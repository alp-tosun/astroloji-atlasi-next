'use client';

import { useState, useEffect } from 'react';
import * as Astronomy from 'astronomy-engine';

interface PlanetBarProps {
  t: (key: string) => string;
}

interface PlanetRow {
  name: string;
  icon: string;
  sign: string;
  signIcon: string;
  retrograde: boolean;
  meaning: string;
}

const SIGNS = ['Koç','Boğa','İkizler','Yengeç','Aslan','Başak','Terazi','Akrep','Yay','Oğlak','Kova','Balık'];
const SIGN_ICONS: Record<string, string> = {
  'Koç': '♈', 'Boğa': '♉', 'İkizler': '♊', 'Yengeç': '♋',
  'Aslan': '♌', 'Başak': '♍', 'Terazi': '♎', 'Akrep': '♏',
  'Yay': '♐', 'Oğlak': '♑', 'Kova': '♒', 'Balık': '♓',
};

// Her gezegen + burç kombinasyonu için kısa anlamlar
const PLANET_MEANINGS: Record<string, Record<string, string>> = {
  'Güneş': {
    'Koç': 'Enerjik ve lider ruhlu bir dönem.',
    'Boğa': 'Kararlılık ve maddi konular ön planda.',
    'İkizler': 'İletişim ve sosyal aktiviteler güçlü.',
    'Yengeç': 'Duygusal derinlik ve aile odağı.',
    'Aslan': 'Yaratıcılık ve özgüven dorukta.',
    'Başak': 'Detaylara dikkat ve sağlık bilinci.',
    'Terazi': 'İlişkiler ve denge arayışı.',
    'Akrep': 'Dönüşüm ve derinlere iniş zamanı.',
    'Yay': 'Özgürlük ve keşif arzusu yüksek.',
    'Oğlak': 'Disiplin ve kariyer odaklı dönem.',
    'Kova': 'Yenilikçi fikirler ve toplumsal bilinç.',
    'Balık': 'Sezgiler güçlü, hayal gücü yoğun.',
  },
  'Ay': {
    'Koç': 'Duygusal tepkiler hızlı ve anlık.',
    'Boğa': 'Duygusal güvenlik ve konfor arayışı.',
    'İkizler': 'Zihinsel hareketlilik ve merak.',
    'Yengeç': 'Duyguların en derin hali, sezgisel.',
    'Aslan': 'Duygusal ifade ve dramatik tepkiler.',
    'Başak': 'Duygularda düzen ve analiz ihtiyacı.',
    'Terazi': 'Uyum arayışı ve ilişki odağı.',
    'Akrep': 'Yoğun duygular ve dönüşüm enerjisi.',
    'Yay': 'Duygusal özgürlük ve iyimserlik.',
    'Oğlak': 'Duygularda kontrol ve sorumluluk.',
    'Kova': 'Bağımsız duygusal yaklaşım.',
    'Balık': 'Empati ve ruhsal hassasiyet dorukta.',
  },
  'Merkür': {
    'Koç': 'Düşünceler hızlı, iletişim direkt.',
    'Boğa': 'Pratik düşünme, yavaş ama sağlam kararlar.',
    'İkizler': 'Zihinsel çeviklik ve çok yönlü iletişim.',
    'Yengeç': 'Duygusal zeka ile düşünme.',
    'Aslan': 'Yaratıcı fikirler ve dramatik ifade.',
    'Başak': 'Analitik düşünme gücü en yüksek.',
    'Terazi': 'Diplomatik iletişim ve denge arayışı.',
    'Akrep': 'Derin araştırma ve gizlileri çözme.',
    'Yay': 'Geniş perspektif ve felsefi düşünce.',
    'Oğlak': 'Yapısal düşünme ve planlı iletişim.',
    'Kova': 'Yenilikçi fikirler ve orijinal düşünceler.',
    'Balık': 'Sezgisel iletişim ve hayal gücü.',
  },
  'Venüs': {
    'Koç': 'Aşkta tutkulu ve hızlı adımlar.',
    'Boğa': 'Aşkta sadakat ve duyusal zevkler.',
    'İkizler': 'Aşkta eğlence ve zihinsel bağ.',
    'Yengeç': 'Aşkta derin bağlanma ve koruma.',
    'Aslan': 'Aşkta cömertlik ve romantizm.',
    'Başak': 'Aşkta özenli ve pratik yaklaşım.',
    'Terazi': 'Aşkta uyum ve estetik zirvededir.',
    'Akrep': 'Aşkta yoğunluk ve tutku.',
    'Yay': 'Aşkta özgürlük ve macera.',
    'Oğlak': 'Aşkta ciddiyet ve bağlılık.',
    'Kova': 'Aşkta özgünlük ve dostça bağ.',
    'Balık': 'Aşkta romantizm ve adanmışlık.',
  },
  'Mars': {
    'Koç': 'Enerji ve motivasyon zirve seviyede.',
    'Boğa': 'Azimli ve kararlı bir enerji akışı.',
    'İkizler': 'Enerji dağınık ama çok yönlü.',
    'Yengeç': 'Duygusal motivasyon ve savunmacı enerji.',
    'Aslan': 'Yaratıcı güç ve cesaret yüksek.',
    'Başak': 'Disiplinli ve metodlu çalışma enerjisi.',
    'Terazi': 'Enerji dengeye yönelir, kararsızlık olabilir.',
    'Akrep': 'Yoğun irade gücü ve dönüştürücü enerji.',
    'Yay': 'Macera ruhu ve fiziksel enerji bol.',
    'Oğlak': 'Stratejik ve hedefe odaklı güç.',
    'Kova': 'Reform enerjisi ve kolektif hareket.',
    'Balık': 'Sezgisel hareket ve şefkatli güç.',
  },
  'Jüpiter': {
    'Koç': 'Cesaret ve girişimcilik genişler.',
    'Boğa': 'Maddi bolluk ve büyüme dönemi.',
    'İkizler': 'Öğrenme ve iletişimde şans.',
    'Yengeç': 'Aile ve duygusal zenginlik.',
    'Aslan': 'Yaratıcılık ve şöhret şansı.',
    'Başak': 'Sağlık ve iş hayatında bereket.',
    'Terazi': 'İlişkilerde ve hukukta şans.',
    'Akrep': 'Derin dönüşümlerden kazanç.',
    'Yay': 'Şans ve genişleme en güçlü hali.',
    'Oğlak': 'Kariyer ve otoritede büyüme.',
    'Kova': 'Yenilik ve insanlık için büyüme.',
    'Balık': 'Ruhsal büyüme ve şefkat.',
  },
  'Satürn': {
    'Koç': 'Sabır ve disiplin dersleri.',
    'Boğa': 'Maddi sorumluluk ve yapılanma.',
    'İkizler': 'İletişimde ciddiyet ve derinlik.',
    'Yengeç': 'Duygusal olgunlaşma zamanı.',
    'Aslan': 'Ego sınavları ve liderlik sorumlulukları.',
    'Başak': 'Çalışma disiplini ve sağlık odağı.',
    'Terazi': 'İlişkilerde sorumluluk ve olgunluk.',
    'Akrep': 'Derin korkularla yüzleşme.',
    'Yay': 'İnançlarda yapılanma ve sınırlama.',
    'Oğlak': 'En güçlü hali, kariyer yapılandırması.',
    'Kova': 'Toplumsal sorumluluk ve reform.',
    'Balık': 'Ruhsal sınırlar ve merhamet dersleri.',
  },
};

function lonToSign(lon: number): string {
  const n = ((lon % 360) + 360) % 360;
  const idx = Math.floor(n / 30) % 12;
  return SIGNS[idx];
}

function getBodyLon(body: string, date: Date): number {
  if (body === 'Sun') return Astronomy.SunPosition(date).elon;
  if (body === 'Moon') return Astronomy.EclipticGeoMoon(date).lon;
  const observer = new Astronomy.Observer(0, 0, 0);
  const eq = Astronomy.Equator(body as Astronomy.Body, date, observer, true, true);
  return Astronomy.Ecliptic(eq.vec).elon;
}

function checkRetrograde(body: string, date: Date): boolean {
  if (body === 'Sun' || body === 'Moon') return false;
  const ms = 86400000;
  const lonBefore = getBodyLon(body, new Date(date.getTime() - ms));
  const lonAfter = getBodyLon(body, new Date(date.getTime() + ms));
  let diff = lonAfter - lonBefore;
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;
  return diff < 0;
}

const PLANET_LIST = [
  { body: 'Sun', name: 'Güneş', icon: '☀️' },
  { body: 'Moon', name: 'Ay', icon: '🌙' },
  { body: 'Mercury', name: 'Merkür', icon: '☿' },
  { body: 'Venus', name: 'Venüs', icon: '♀️' },
  { body: 'Mars', name: 'Mars', icon: '♂️' },
  { body: 'Jupiter', name: 'Jüpiter', icon: '♃' },
  { body: 'Saturn', name: 'Satürn', icon: '♄' },
];

export function PlanetBar({ t }: PlanetBarProps) {
  const [planets, setPlanets] = useState<PlanetRow[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const now = new Date();
      const result: PlanetRow[] = PLANET_LIST.map(({ body, name, icon }) => {
        const lon = getBodyLon(body, now);
        const sign = lonToSign(lon);
        const retrograde = checkRetrograde(body, now);
        const meaning = PLANET_MEANINGS[name]?.[sign] || '';
        return { name, icon, sign, signIcon: SIGN_ICONS[sign] || '', retrograde, meaning };
      });
      setPlanets(result);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-surface/50 p-6 text-center">
        <p className="text-sm text-muted animate-pulse">Gezegen verileri hesaplanıyor...</p>
      </div>
    );
  }

  if (!planets) return null;

  const mercury = planets.find((p) => p.name === 'Merkür');

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <h3 className="text-base font-semibold text-text">{t('panel_gezegen_title') || 'Gezegen Durumu'}</h3>
        <span className="text-green-400 text-xs font-medium flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
          {t('live_badge')}
        </span>
      </div>

      {/* Mercury Retro Alert */}
      {mercury?.retrograde && (
        <div className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 p-3">
          <span className="text-lg">⚠️</span>
          <div>
            <p className="text-sm font-semibold text-red-400">Merkür Retrosu Aktif!</p>
            <p className="text-xs text-red-400/70">İletişim, teknoloji ve seyahatte dikkatli olun. Önemli kararları mümkünse erteleyin.</p>
          </div>
        </div>
      )}

      {/* Planet Grid */}
      <div className="grid grid-cols-1 gap-2">
        {planets.map((p) => (
          <div
            key={p.name}
            className={`flex items-center gap-3 rounded-xl p-3 transition-all ${
              p.retrograde
                ? 'bg-red-500/5 border border-red-500/15'
                : 'bg-card/40 border border-border/50'
            }`}
          >
            <span className="text-xl w-8 text-center shrink-0">{p.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-text">{p.name}</span>
                <span className="text-sm text-accent-light font-medium">{p.signIcon} {p.sign}</span>
                {p.retrograde && (
                  <span className="text-[10px] bg-red-500/15 text-red-400 px-1.5 py-0.5 rounded-full font-semibold">
                    ℞ RETRO
                  </span>
                )}
              </div>
              <p className="text-xs text-muted mt-0.5 leading-relaxed">{p.meaning}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
