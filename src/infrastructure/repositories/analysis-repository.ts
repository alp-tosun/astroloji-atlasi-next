import { saveAnalysis, updateStreak } from '@/lib/firebase/firestore-admin';
import type { IAnalysisRepository } from '@/domain/ports/analysis-repository';

export class AnalysisRepositoryImpl implements IAnalysisRepository {
  async saveAnalysis(uid: string, toolId: string, content: string): Promise<void> {
    await saveAnalysis(uid, toolId, content);
  }

  async updateStreak(uid: string): Promise<void> {
    await updateStreak(uid);
  }
}
