export interface IAnalysisRepository {
  saveAnalysis(uid: string, toolId: string, content: string): Promise<void>;
  updateStreak(uid: string): Promise<void>;
}
