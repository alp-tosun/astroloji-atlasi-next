import { NextRequest } from 'next/server';
import { risingSchema } from '@/lib/validation/schemas';
import { apiError, streamResponse } from '@/lib/api-helpers';
import { withApiGuards } from '@/lib/api-middleware';
import { useCases } from '@/application/di/container';
import { UseCaseError } from '@/domain/entities/use-case-error';

export async function POST(req: NextRequest) {
  const guard = await withApiGuards(req, risingSchema, { rateLimit: 'ai', premium: false });
  if ('response' in guard) return guard.response;
  try {
    const { stream, onComplete } = await useCases.rising.execute(guard.data, guard.uid);
    return streamResponse(stream, onComplete);
  } catch (e) {
    if (e instanceof UseCaseError) return apiError(e.message, e.statusCode);
    console.error('/api/rising:', e);
    return apiError('Yapay zeka yanıt üretemedi.');
  }
}
