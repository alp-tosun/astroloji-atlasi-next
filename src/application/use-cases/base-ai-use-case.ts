import type { IAIService, AIStream } from '@/domain/ports/ai-service';
import type { IAnalysisRepository } from '@/domain/ports/analysis-repository';
import type { PromptPair } from '@/domain/entities/prompt-pair';

export interface StreamResult {
  stream: AIStream;
  onComplete: (full: string) => void;
}

export abstract class BaseAIUseCase<TInput> {
  constructor(
    protected aiService: IAIService,
    protected analysisRepo: IAnalysisRepository,
    protected toolId: string,
  ) {}

  async execute(input: TInput, uid: string): Promise<StreamResult> {
    const prompt = await this.buildPrompt(input);
    const stream = await this.aiService.chatStream(
      prompt.systemPrompt,
      prompt.userPrompt,
      prompt.maxTokens,
    );

    if (uid && this.shouldSaveAnalysis(input)) {
      this.analysisRepo.updateStreak(uid).catch(() => {});
    }

    const onComplete = (full: string) => {
      if (uid && this.shouldSaveAnalysis(input)) {
        this.analysisRepo.saveAnalysis(uid, this.toolId, full.substring(0, 1000)).catch(() => {});
      }
    };

    return { stream, onComplete };
  }

  protected shouldSaveAnalysis(_input: TInput): boolean {
    return true;
  }

  protected abstract buildPrompt(input: TInput): Promise<PromptPair> | PromptPair;
}
