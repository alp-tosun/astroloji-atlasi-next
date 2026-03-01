import { adminDb } from './firebase/admin';

export async function isPremiumUser(uid: string): Promise<boolean> {
  try {
    const doc = await adminDb.collection('users').doc(uid).get();
    if (!doc.exists) return false;
    const data = doc.data();
    return data?.premium === true || data?.subscription === 'premium' || data?.isPremium === true;
  } catch {
    return false;
  }
}
