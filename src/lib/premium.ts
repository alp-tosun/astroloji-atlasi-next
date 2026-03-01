import { adminDb } from './firebase/admin';

export async function isPremiumUser(uid: string): Promise<boolean> {
  try {
    const doc = await adminDb.collection('users').doc(uid).get();
    if (!doc.exists) return false;
    const data = doc.data();
    const hasPremium = data?.premium === true || data?.subscription === 'premium' || data?.isPremium === true;
    if (!hasPremium) return false;
    // Check expiration if set
    if (data?.premiumExpiresAt) {
      const expiresAt = typeof data.premiumExpiresAt === 'number'
        ? data.premiumExpiresAt
        : new Date(data.premiumExpiresAt).getTime();
      if (expiresAt < Date.now()) return false;
    }
    return true;
  } catch {
    return false;
  }
}
