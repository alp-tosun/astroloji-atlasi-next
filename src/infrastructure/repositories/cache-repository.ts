import { adminDb } from '@/lib/firebase/admin';
import type { ICacheRepository } from '@/domain/ports/cache-repository';

export class CacheRepositoryImpl implements ICacheRepository {
  async get(collection: string, key: string): Promise<string | null> {
    try {
      const doc = await adminDb.collection(collection).doc(key).get();
      if (doc.exists) return doc.data()?.content || null;
    } catch { /* cache miss */ }
    return null;
  }

  async set(collection: string, key: string, data: Record<string, unknown>): Promise<void> {
    try {
      await adminDb.collection(collection).doc(key).set(data);
    } catch (e) {
      console.error(`Cache write error [${collection}/${key}]:`, e);
    }
  }
}
