import { NextRequest } from 'next/server';
import { calculateNatalChart } from '@/lib/astrology/natal-chart';
import { geocode } from '@/lib/astrology/geocoding';
import { withApiGuards } from '@/lib/api-middleware';
import { apiSuccess, apiError } from '@/lib/api-helpers';
import { natalSchema } from '@/lib/validation/schemas';

export async function POST(req: NextRequest) {
  const guard = await withApiGuards(req, natalSchema, { rateLimit: 'data' });
  if ('response' in guard) return guard.response;

  const { date: dateStr, houseSystem } = guard.data;
  let { latitude, longitude } = guard.data;
  const date = new Date(dateStr);

  // If no coords but place given, geocode
  if (latitude === undefined || longitude === undefined) {
    if (guard.data.place) {
      const geo = await geocode(guard.data.place);
      if (geo) {
        latitude = geo.lat;
        longitude = geo.lng;
      } else {
        return apiError('Konum bulunamadı', 400);
      }
    } else {
      // Default to Istanbul
      latitude = 41.0082;
      longitude = 28.9784;
    }
  }

  const chart = calculateNatalChart(date, latitude, longitude, houseSystem);

  return apiSuccess({
    date: chart.date.toISOString(),
    location: { latitude, longitude },
    ascendant: chart.ascendant,
    houses: chart.houses,
    planets: chart.planets,
    aspects: chart.aspects,
    houseSystem: chart.houseSystem,
  });
}
