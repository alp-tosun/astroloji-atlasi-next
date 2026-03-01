import { NextRequest, NextResponse } from 'next/server';
import { getAllPlanetPositions } from '@/lib/astrology/ephemeris';
import { getMoonPhase } from '@/lib/astrology/moon-phase';
import { getMercuryRetrograde } from '@/lib/astrology/mercury-retrograde';
import { getSunSign } from '@/lib/astrology/sun-sign';
import { withRateLimit } from '@/lib/api-middleware';

export async function GET(req: NextRequest) {
  const rateLimitResponse = await withRateLimit(req, 'data');
  if (rateLimitResponse) return rateLimitResponse;

  const dateParam = req.nextUrl.searchParams.get('date');
  const date = dateParam ? new Date(dateParam) : new Date();
  
  if (isNaN(date.getTime())) {
    return NextResponse.json({ error: 'Geçersiz tarih formatı' }, { status: 400 });
  }
  
  const planets = getAllPlanetPositions(date);
  const moonPhase = getMoonPhase(date);
  const mercuryRetro = getMercuryRetrograde(date);
  const sunSign = getSunSign(date);
  
  return NextResponse.json({
    date: date.toISOString(),
    sunSign,
    moonPhase,
    mercuryRetrograde: mercuryRetro,
    planets,
  });
}
