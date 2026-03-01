import { NextRequest } from 'next/server';
import { moonSignSchema } from '@/lib/validation/schemas';
import { apiError, streamResponse } from '@/lib/api-helpers';
import { withApiGuards } from '@/lib/api-middleware';
import { useCases } from '@/application/di/container';
import { UseCaseError } from '@/domain/entities/use-case-error';

export async function POST(req: NextRequest) {
  const guard = await withApiGuards(req, moonSignSchema, { rateLimit: 'ai', premium: false });
  if ('response' in guard) return guard.response;
  try {
    const { stream, onComplete } = await useCases.moonSign.execute(guard.data, guard.uid);
    return streamResponse(stream, onComplete);
  } catch (e) {
    if (e instanceof UseCaseError) return apiError(e.message, e.statusCode);
    console.error('/api/moon-sign:', e);
    return apiError('Yapay zeka yanıt üretemedi.');
  }
}
