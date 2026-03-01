import { NextRequest, NextResponse } from 'next/server';
import { calculateNatalChart } from '@/lib/astrology/natal-chart';
import { geocode } from '@/lib/astrology/geocoding';
import { z } from 'zod';
import { withRateLimit } from '@/lib/api-middleware';

const natalSchema = z.object({
  date: z.string().refine((d) => !isNaN(new Date(d).getTime()), 'Geçersiz tarih'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  place: z.string().optional(),
  houseSystem: z.enum(['placidus', 'whole-sign', 'equal']).default('whole-sign'),
});

export async function POST(req: NextRequest) {
  const rateLimitResponse = await withRateLimit(req, 'data');
  if (rateLimitResponse) return rateLimitResponse;

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Geçersiz JSON' }, { status: 400 });
  }
  
  const parsed = natalSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }
  
  const { date: dateStr, houseSystem } = parsed.data;
  let { latitude, longitude } = parsed.data;
  const date = new Date(dateStr);
  
  // If no coords but place given, geocode
  if (latitude === undefined || longitude === undefined) {
    if (parsed.data.place) {
      const geo = await geocode(parsed.data.place);
      if (geo) {
        latitude = geo.lat;
        longitude = geo.lng;
      } else {
        return NextResponse.json({ error: 'Konum bulunamadı' }, { status: 400 });
      }
    } else {
      // Default to Istanbul
      latitude = 41.0082;
      longitude = 28.9784;
    }
  }
  
  const chart = calculateNatalChart(date, latitude, longitude, houseSystem);
  
  return NextResponse.json({
    date: chart.date.toISOString(),
    location: { latitude, longitude },
    ascendant: chart.ascendant,
    houses: chart.houses,
    planets: chart.planets,
    aspects: chart.aspects,
    houseSystem: chart.houseSystem,
  });
}
