import { NextRequest, NextResponse } from 'next/server';
import { withRateLimit } from '@/lib/api-middleware';

export const dynamic = 'force-dynamic';

// In-memory cache for ipgeolocation API responses
let ipgeoCache: { data: Record<string, unknown>; timestamp: number } | null = null;
const CACHE_TTL = 3600_000; // 1 hour in ms

const EVRE_MAP: Record<string, [string, string]> = {
  NEW_MOON: ['Yeni Ay', '🌑'],
  WAXING_CRESCENT: ['Hilal', '🌒'],
  FIRST_QUARTER: ['İlk Dördün', '🌓'],
  WAXING_GIBBOUS: ['Şişen Ay', '🌔'],
  FULL_MOON: ['Dolunay', '🌕'],
  WANING_GIBBOUS: ['Azalan Ay', '🌖'],
  LAST_QUARTER: ['Son Dördün', '🌗'],
  WANING_CRESCENT: ['Eski Ay', '🌘'],
};

const MERKUR_RETRO = [
  { bas: '2025-03-15', bit: '2025-04-07' },
  { bas: '2025-07-18', bit: '2025-08-11' },
  { bas: '2025-11-09', bit: '2025-11-29' },
  { bas: '2026-03-15', bit: '2026-04-07' },
];

function getSunSign(month: number, day: number): string {
  const md = month * 100 + day;
  if (md >= 321 && md <= 419) return 'Koç';
  if (md >= 420 && md <= 520) return 'Boğa';
  if (md >= 521 && md <= 620) return 'İkizler';
  if (md >= 621 && md <= 722) return 'Yengeç';
  if (md >= 723 && md <= 822) return 'Aslan';
  if (md >= 823 && md <= 922) return 'Başak';
  if (md >= 923 && md <= 1022) return 'Terazi';
  if (md >= 1023 && md <= 1121) return 'Akrep';
  if (md >= 1122 && md <= 1221) return 'Yay';
  if (md >= 1222 || md <= 119) return 'Oğlak';
  if (md >= 120 && md <= 218) return 'Kova';
  return 'Balık';
}

function fallbackMoonPhase(date: Date): [string, string] {
  const ref = new Date('2000-01-06');
  const days = (date.getTime() - ref.getTime()) / (1000 * 60 * 60 * 24);
  const pct = ((days % 29.53) / 29.53) * 100;
  if (pct < 6.25) return ['Yeni Ay', '🌑'];
  if (pct < 31.25) return ['Hilal', '🌒'];
  if (pct < 43.75) return ['İlk Dördün', '🌓'];
  if (pct < 56.25) return ['Şişen Ay', '🌔'];
  if (pct < 68.75) return ['Dolunay', '🌕'];
  if (pct < 81.25) return ['Azalan Ay', '🌖'];
  if (pct < 93.75) return ['Son Dördün', '🌗'];
  return ['Eski Ay', '🌘'];
}

export async function GET(req: NextRequest) {
  const rateLimitResponse = await withRateLimit(req, 'data');
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const now = new Date();
    const tarih = now.toISOString().split('T')[0];
    const month = now.getMonth() + 1;
    const day = now.getDate();

    let ayEvresi = 'Bilinmiyor';
    let ayIkon = '🌙';
    let gundogumu = '';
    let gunbatimi = '';
    let ayDogumu = '';
    let ayBatimi = '';

    // Try ipgeolocation API
    const apiKey = process.env.IPGEO_API_KEY;
    if (apiKey) {
      try {
        let ipgeo: Record<string, unknown>;
        if (ipgeoCache && Date.now() - ipgeoCache.timestamp < CACHE_TTL) {
          ipgeo = ipgeoCache.data;
        } else {
          const ipgeoRes = await fetch(
            `https://api.ipgeolocation.io/astronomy?apiKey=${apiKey}&lat=39.9208&long=32.8541&date=${tarih}`,
          );
          ipgeo = await ipgeoRes.json();
          ipgeoCache = { data: ipgeo, timestamp: Date.now() };
        }
        if (ipgeo?.moon_status) {
          const status = ipgeo.moon_status as string;
          const evre = EVRE_MAP[status] || [status, '🌙'];
          ayEvresi = evre[0];
          ayIkon = evre[1];
          gundogumu = (ipgeo.sunrise as string) || '';
          gunbatimi = (ipgeo.sunset as string) || '';
          ayDogumu = (ipgeo.moonrise as string) || '';
          ayBatimi = (ipgeo.moonset as string) || '';
        }
      } catch (e) {
        console.log('ipgeo error:', e);
        const [evreName, evreIcon] = fallbackMoonPhase(now);
        ayEvresi = evreName;
        ayIkon = evreIcon;
      }
    } else {
      const [evreName, evreIcon] = fallbackMoonPhase(now);
      ayEvresi = evreName;
      ayIkon = evreIcon;
    }

    const merkurRetroMu = MERKUR_RETRO.some((r) => tarih >= r.bas && tarih <= r.bit);
    const gunesBurcu = getSunSign(month, day);

    return NextResponse.json({
      ok: true,
      tarih,
      ayEvresi,
      ayIkon,
      merkurRetro: merkurRetroMu,
      gunesBurcu,
      gundogumu,
      gunbatimi,
      ayDogumu,
      ayBatimi,
    });
  } catch (e) {
    return NextResponse.json({
      ok: false,
      error: e instanceof Error ? e.message : 'Unknown error',
    });
  }
}
