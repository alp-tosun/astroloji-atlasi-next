import { NextRequest } from 'next/server';
import { yildizNameSchema } from '@/lib/validation/schemas';
import { apiError, streamResponse } from '@/lib/api-helpers';
import { withApiGuards } from '@/lib/api-middleware';
import { useCases } from '@/application/di/container';
import { UseCaseError } from '@/domain/entities/use-case-error';

export async function POST(req: NextRequest) {
  const guard = await withApiGuards(req, yildizNameSchema, { rateLimit: 'ai', premium: true });
  if ('response' in guard) return guard.response;
  try {
    const { stream, onComplete } = await useCases.yildizName.execute(guard.data, guard.uid);
    return streamResponse(stream, onComplete);
  } catch (e) {
    if (e instanceof UseCaseError) return apiError(e.message, e.statusCode);
    console.error('/api/yildizname:', e);
    return apiError('Yıldızname yorumu oluşturulamadı.');
  }
}
