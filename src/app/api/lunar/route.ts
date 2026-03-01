import { NextRequest } from 'next/server';
import { lunarSchema } from '@/lib/validation/schemas';
import { apiError, streamResponse } from '@/lib/api-helpers';
import { withApiGuards } from '@/lib/api-middleware';
import { useCases } from '@/application/di/container';

export async function POST(req: NextRequest) {
  const guard = await withApiGuards(req, lunarSchema, { rateLimit: 'ai', premium: false });
  if ('response' in guard) return guard.response;
  try {
    const { stream, onComplete } = await useCases.lunar.execute(guard.data, guard.uid);
    return streamResponse(stream, onComplete);
  } catch (e) {
    console.error('/api/lunar:', e);
    return apiError('Yapay zeka yanıt üretemedi.');
  }
}
