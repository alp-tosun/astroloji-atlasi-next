import { NextRequest, NextResponse } from 'next/server';
import { ritualSchema } from '@/lib/validation/schemas';
import { apiError, streamResponse } from '@/lib/api-helpers';
import { withApiGuards } from '@/lib/api-middleware';
import { useCases } from '@/application/di/container';

export async function POST(req: NextRequest) {
  const guard = await withApiGuards(req, ritualSchema, { rateLimit: 'ai', premium: false });
  if ('response' in guard) return guard.response;
  try {
    const result = await useCases.ritual.execute(guard.data, guard.uid);
    if ('cached' in result) {
      return NextResponse.json({ ok: true, result: result.cached, cached: true });
    }
    return streamResponse(result.stream, result.onComplete);
  } catch (e) {
    console.error('/api/ritual:', e);
    return apiError('Ritüel oluşturulamadı.');
  }
}
