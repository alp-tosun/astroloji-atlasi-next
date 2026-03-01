import { NextRequest } from 'next/server';
import { dreamSchema } from '@/lib/validation/schemas';
import { apiError, streamResponse } from '@/lib/api-helpers';
import { withApiGuards } from '@/lib/api-middleware';
import { useCases } from '@/application/di/container';

export async function POST(req: NextRequest) {
  const guard = await withApiGuards(req, dreamSchema, { rateLimit: 'ai', premium: true });
  if ('response' in guard) return guard.response;
  try {
    const { stream, onComplete } = await useCases.dream.execute(guard.data, guard.uid);
    return streamResponse(stream, onComplete);
  } catch (e) {
    console.error('/api/dream:', e);
    return apiError('Yapay zeka yanıt üretemedi.');
  }
}
