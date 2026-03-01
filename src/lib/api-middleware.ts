import { NextRequest, NextResponse } from 'next/server';
import { ZodSchema, ZodError } from 'zod';
import { checkRateLimit, getClientIP, aiLimiter, dataLimiter } from './rate-limit';
import { adminAuth } from './firebase/admin';
import { isPremiumUser } from './premium';

type RateLimitType = 'ai' | 'data';

export async function withRateLimit(
  request: Request,
  type: RateLimitType = 'ai'
): Promise<NextResponse | null> {
  const limiter = type === 'ai' ? aiLimiter : dataLimiter;
  const ip = getClientIP(request);
  const result = await checkRateLimit(limiter, ip);

  if (!result.success) {
    return NextResponse.json(
      { error: 'Çok fazla istek gönderildi. Lütfen biraz bekleyin.' },
      {
        status: 429,
        headers: {
          'Retry-After': '60',
          'X-RateLimit-Remaining': String(result.remaining ?? 0),
        },
      }
    );
  }

  return null; // OK, proceed
}

/**
 * Verify Firebase ID token from Authorization header.
 * Compares token uid with body uid to prevent spoofing.
 */
export async function verifyAuth(
  req: NextRequest,
  bodyUid?: string,
): Promise<{ uid: string } | { response: NextResponse }> {
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  // If body has uid but no token → reject
  if (bodyUid && !token) {
    return {
      response: NextResponse.json(
        { error: 'Yetkilendirme gerekli.' },
        { status: 401 },
      ),
    };
  }

  // No token and no uid → anonymous request (allowed for some endpoints)
  if (!token) {
    return { uid: '' };
  }

  try {
    const decoded = await adminAuth.verifyIdToken(token);

    // If body uid doesn't match token uid → spoofing attempt
    if (bodyUid && decoded.uid !== bodyUid) {
      return {
        response: NextResponse.json(
          { error: 'Yetkilendirme hatası: kullanıcı uyuşmazlığı.' },
          { status: 403 },
        ),
      };
    }

    return { uid: decoded.uid };
  } catch {
    return {
      response: NextResponse.json(
        { error: 'Geçersiz veya süresi dolmuş token.' },
        { status: 401 },
      ),
    };
  }
}

/**
 * Check if the user has premium subscription.
 */
export async function requirePremium(
  uid: string,
): Promise<NextResponse | null> {
  if (!uid) {
    return NextResponse.json(
      { error: 'Premium erişim için giriş yapmalısınız.' },
      { status: 401 },
    );
  }

  const premium = await isPremiumUser(uid);
  if (!premium) {
    return NextResponse.json(
      { error: 'Bu özellik yalnızca Premium üyelere açıktır.' },
      { status: 403 },
    );
  }

  return null; // OK
}

/**
 * All-in-one API guard wrapper.
 * Applies in order: rate limit → parse & validate → auth verify → optional premium check
 */
export async function withApiGuards<T>(
  req: NextRequest,
  schema: ZodSchema<T>,
  options: { rateLimit?: RateLimitType; premium?: boolean } = {},
): Promise<{ data: T; uid: string } | { response: NextResponse }> {
  const { rateLimit = 'ai', premium = false } = options;

  // 1. Rate limit
  const rateLimitResponse = await withRateLimit(req, rateLimit);
  if (rateLimitResponse) return { response: rateLimitResponse };

  // 2. Parse & validate body
  let data: T;
  try {
    const body = await req.json();
    data = schema.parse(body);
  } catch (e) {
    if (e instanceof ZodError) {
      const msg = e.errors.map((err) => err.message).join(', ');
      return {
        response: NextResponse.json({ ok: false, error: msg }, { status: 400 }),
      };
    }
    return {
      response: NextResponse.json(
        { ok: false, error: 'Geçersiz istek.' },
        { status: 400 },
      ),
    };
  }

  // 3. Auth verify
  const bodyUid = (data as Record<string, unknown>).uid as string | undefined;
  const authResult = await verifyAuth(req, bodyUid);
  if ('response' in authResult) return authResult;

  // 4. Premium check
  if (premium) {
    const premiumResponse = await requirePremium(authResult.uid);
    if (premiumResponse) return { response: premiumResponse };
  }

  return { data, uid: authResult.uid };
}
