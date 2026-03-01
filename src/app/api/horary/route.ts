import { NextRequest } from 'next/server';
import { horarySchema } from '@/lib/validation/schemas';
import { apiError, streamResponse } from '@/lib/api-helpers';
import { withApiGuards } from '@/lib/api-middleware';
import { useCases } from '@/application/di/container';

export async function POST(req: NextRequest) {
  const guard = await withApiGuards(req, horarySchema, { rateLimit: 'ai', premium: true });
  if ('response' in guard) return guard.response;
  try {
    const { stream, onComplete } = await useCases.horary.execute(guard.data, guard.uid);
    return streamResponse(stream, onComplete);
  } catch (e) {
    console.error('/api/horary:', e);
    return apiError('Yapay zeka yanıt üretemedi.');
  }
}
