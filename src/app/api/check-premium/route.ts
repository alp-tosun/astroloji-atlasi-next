import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const token = authHeader.slice(7);
    const decoded = await adminAuth.verifyIdToken(token);
    const uid = decoded.uid;

    const userDoc = await adminDb.collection('users').doc(uid).get();

    if (!userDoc.exists) {
      return NextResponse.json({ isPremium: false });
    }

    const data = userDoc.data();
    const isPremium = data?.premium === true;

    // Check if premium has expired
    if (isPremium && data?.premiumExpiresAt) {
      const expiresAt = new Date(data.premiumExpiresAt);
      if (expiresAt < new Date()) {
        return NextResponse.json({ isPremium: false });
      }
    }

    return NextResponse.json({ isPremium });
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}
