import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

const WEBHOOK_AUTH_KEY = process.env.REVENUECAT_WEBHOOK_AUTH_KEY || '';

export async function POST(req: NextRequest) {
  // Verify webhook auth
  const authHeader = req.headers.get('authorization');
  if (!WEBHOOK_AUTH_KEY || authHeader !== `Bearer ${WEBHOOK_AUTH_KEY}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const event = body.event;

    if (!event) {
      return NextResponse.json({ error: 'No event' }, { status: 400 });
    }

    const appUserId = event.app_user_id;
    if (!appUserId) {
      return NextResponse.json({ error: 'No user ID' }, { status: 400 });
    }

    const userRef = adminDb.collection('users').doc(appUserId);

    // Determine premium status based on event type
    const premiumEvents = [
      'INITIAL_PURCHASE',
      'RENEWAL',
      'PRODUCT_CHANGE',
      'UNCANCELLATION',
    ];
    const nonPremiumEvents = [
      'EXPIRATION',
      'CANCELLATION',
      'BILLING_ISSUE',
    ];

    const eventType = event.type;

    if (premiumEvents.includes(eventType)) {
      await userRef.set(
        {
          premium: true,
          premiumUpdatedAt: new Date().toISOString(),
          premiumExpiresAt: event.expiration_at_ms
            ? new Date(event.expiration_at_ms).toISOString()
            : null,
        },
        { merge: true },
      );
    } else if (nonPremiumEvents.includes(eventType)) {
      await userRef.set(
        {
          premium: false,
          premiumUpdatedAt: new Date().toISOString(),
        },
        { merge: true },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[RevenueCat Webhook] Error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
