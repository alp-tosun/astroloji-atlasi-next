import { NextRequest, NextResponse } from 'next/server';
import { apiError, streamResponse } from '@/lib/api-helpers';
import { withRateLimit, verifyAuth, requirePremium } from '@/lib/api-middleware';
import { useCases } from '@/application/di/container';
import type { Profile } from '@/types/profile';

type ContentType = 'gunun-karti' | 'haftalik' | 'aylik';

export async function POST(req: NextRequest) {
  const rateLimitResponse = await withRateLimit(req, 'ai');
  if (rateLimitResponse) return rateLimitResponse;

  let body: { type?: string; lang?: string; burc?: string; profil?: Profile; uid?: string };
  try {
    body = await req.json();
  } catch {
    return apiError('Geçersiz istek.', 400);
  }

  const type = body.type as ContentType;
  if (!['gunun-karti', 'haftalik', 'aylik'].includes(type)) {
    return apiError('Geçersiz içerik tipi.', 400);
  }

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
