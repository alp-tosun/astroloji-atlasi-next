// Server-only — yalnızca API route'larında kullanılır
import { adminDb } from './admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function saveAnalysis(uid: string, tip: string, veri: string) {
  try {
    const ref = await adminDb.collection('users').doc(uid).collection('analizler').add({
      tip,
      veri,
      tarih: new Date().toISOString(),
    });
    console.log(`[saveAnalysis] OK — uid=${uid}, tip=${tip}, docId=${ref.id}`);
  } catch (err) {
    console.error(`[saveAnalysis] HATA — uid=${uid}, tip=${tip}`, err);
    throw err;
  }
}

const BADGE_MILESTONES = [7, 30, 100];

export async function updateStreak(uid: string) {
  try {
    const userRef = adminDb.collection('users').doc(uid);
    const snap = await userRef.get();
    const data = snap.data() || {};

    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10); // YYYY-MM-DD

    const lastActive: string = data.lastActiveDate || '';
    const currentStreak: number = data.streak || 0;
    const longestStreak: number = data.longestStreak || 0;
    const badges: string[] = data.badges || [];

    let newStreak = currentStreak;

    if (lastActive === todayStr) {
      // Already active today — just increment totalAnalyses
      await userRef.set({ totalAnalyses: FieldValue.increment(1) }, { merge: true });
      return;
    }

    // Check if yesterday
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);

    if (lastActive === yesterdayStr) {
      newStreak = currentStreak + 1;
    } else {
      // Streak broken — reset to 1
      newStreak = 1;
    }

    const newLongest = Math.max(longestStreak, newStreak);

    // Check badge milestones
    const newBadges = [...badges];
    for (const milestone of BADGE_MILESTONES) {
      const badgeKey = `streak-${milestone}`;
      if (newStreak >= milestone && !newBadges.includes(badgeKey)) {
        newBadges.push(badgeKey);
      }
    }

    await userRef.set(
      {
        streak: newStreak,
        lastActiveDate: todayStr,
        longestStreak: newLongest,
        totalAnalyses: FieldValue.increment(1),
        badges: newBadges,
      },
      { merge: true },
    );

    console.log(`[updateStreak] uid=${uid} streak=${newStreak} longest=${newLongest}`);
  } catch (err) {
    console.error(`[updateStreak] HATA — uid=${uid}`, err);
  }
}
