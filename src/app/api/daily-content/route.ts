import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { apiError, streamResponse } from '@/lib/api-helpers';
import { withRateLimit, verifyAuth, requirePremium } from '@/lib/api-middleware';
import { useCases } from '@/application/di/container';
import { dailyContentSchema } from '@/lib/validation/schemas';

type ContentType = 'gunun-karti' | 'haftalik' | 'aylik';

export async function POST(req: NextRequest) {
  const rateLimitResponse = await withRateLimit(req, 'ai');
  if (rateLimitResponse) return rateLimitResponse;

  let body: ReturnType<typeof dailyContentSchema.parse>;
  try {
    const raw = await req.json();
    body = dailyContentSchema.parse(raw);
  } catch (e) {
    if (e instanceof ZodError) {
      const msg = e.errors.map((err) => err.message).join(', ');
      return apiError(msg, 400);
    }
    return apiError('Geçersiz istek.', 400);
  }

  const type = body.type as ContentType;

  const authResult = await verifyAuth(req, body.uid);
  if ('response' in authResult) return authResult.response;

  if (type === 'haftalik' || type === 'aylik') {
    const premiumResponse = await requirePremium(authResult.uid);
    if (premiumResponse) return premiumResponse;
  }

  try {
    const result = await useCases.dailyContent.execute(
      { type, lang: body.lang || 'tr', burc: body.burc || '', profil: body.profil || null },
      authResult.uid,
    );
    if ('cached' in result) {
      return NextResponse.json({ ok: true, result: result.cached, cached: true });
    }
    return streamResponse(result.stream, result.onComplete);
  } catch (e) {
    console.error('/api/daily-content:', e);
    return apiError('İçerik üretilemedi.');
  }
}
