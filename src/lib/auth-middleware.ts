import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from './firebase/admin';
import { isPremiumUser } from './premium';

export interface AuthenticatedUser {
  uid: string;
  email?: string;
}

/**
 * Extract and verify Firebase ID token from Authorization header.
 * Returns the decoded user or null if invalid/missing.
 */
export async function verifyAuth(
  req: NextRequest,
): Promise<AuthenticatedUser | null> {
  const header = req.headers.get('authorization');
  if (!header?.startsWith('Bearer ')) return null;

  const token = header.slice(7);
  if (!token) return null;

  try {
    const decoded = await adminAuth.verifyIdToken(token);
    return { uid: decoded.uid, email: decoded.email };
  } catch {
    return null;
  }
}

/**
 * Middleware: requires a valid Firebase auth token.
 * Returns 401 if not authenticated.
 */
export function withAuth(
  handler: (req: NextRequest, user: AuthenticatedUser) => Promise<NextResponse>,
) {
  return async (req: NextRequest) => {
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json(
        { ok: false, error: 'Oturum açmanız gerekiyor.' },
        { status: 401 },
      );
    }
    return handler(req, user);
  };
}

/**
 * Middleware: requires auth + active premium subscription.
 * Returns 401 if not authenticated, 403 if not premium.
 */
export function withPremium(
  handler: (req: NextRequest, user: AuthenticatedUser) => Promise<NextResponse>,
) {
  return async (req: NextRequest) => {
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json(
        { ok: false, error: 'Oturum açmanız gerekiyor.' },
        { status: 401 },
      );
    }

    const premium = await isPremiumUser(user.uid);
    if (!premium) {
      return NextResponse.json(
        { ok: false, error: 'Bu özellik premium üyelik gerektirir.' },
        { status: 403 },
      );
    }

    return handler(req, user);
  };
}
