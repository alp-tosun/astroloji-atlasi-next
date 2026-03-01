import { NextRequest } from 'next/server';
import { getAllPlanetPositions } from '@/lib/astrology/ephemeris';
import { getMoonPhase } from '@/lib/astrology/moon-phase';
import { getMercuryRetrograde } from '@/lib/astrology/mercury-retrograde';
import { getSunSign } from '@/lib/astrology/sun-sign';
import { withRateLimit } from '@/lib/api-middleware';
import { apiSuccess, apiError } from '@/lib/api-helpers';

export async function GET(req: NextRequest) {
  const rateLimitResponse = await withRateLimit(req, 'data');
  if (rateLimitResponse) return rateLimitResponse;

  const dateParam = req.nextUrl.searchParams.get('date');
  const date = dateParam ? new Date(dateParam) : new Date();

  if (isNaN(date.getTime())) {
    return apiError('Geçersiz tarih formatı', 400);
  }

  const planets = getAllPlanetPositions(date);
  const moonPhase = getMoonPhase(date);
  const mercuryRetro = getMercuryRetrograde(date);
  const sunSign = getSunSign(date);

  return apiSuccess({
    date: date.toISOString(),
    sunSign,
    moonPhase,
    mercuryRetrograde: mercuryRetro,
    planets,
  });
}
