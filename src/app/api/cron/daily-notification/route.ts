import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { sendPushToUser } from '@/lib/firebase/push';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  // Verify cron secret to prevent unauthorized access
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get all users
    const usersSnap = await adminDb.collection('users').get();

    let sent = 0;
    let failed = 0;

    for (const userDoc of usersSnap.docs) {
      // Get FCM tokens for this user
      const tokensSnap = await adminDb
        .collection('users')
        .doc(userDoc.id)
        .collection('fcmTokens')
        .get();

      const tokens = tokensSnap.docs.map((d) => d.data().token as string).filter(Boolean);

      if (tokens.length === 0) continue;

      try {
        await sendPushToUser(
          tokens,
          'Günlük yorumun hazır!',
          'Bugün yıldızlar senin için ne söylüyor? Hemen keşfet.',
          { action: 'open_daily' },
        );
        sent++;
      } catch {
        failed++;
      }
    }

    return NextResponse.json({
      ok: true,
      sent,
      failed,
      total: usersSnap.size,
    });
  } catch (error) {
    console.error('[Cron] Daily notification error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
