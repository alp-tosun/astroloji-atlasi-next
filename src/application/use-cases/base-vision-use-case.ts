import type { IAIService, AIStream } from '@/domain/ports/ai-service';
import type { IAnalysisRepository } from '@/domain/ports/analysis-repository';
import type { PromptPair } from '@/domain/entities/prompt-pair';

export interface VisionStreamResult {
  stream: AIStream;
  onComplete: (full: string) => void;
}

export abstract class BaseVisionUseCase<TInput> {
  constructor(
    protected aiService: IAIService,
    protected analysisRepo: IAnalysisRepository,
    protected toolId: string,
  ) {}

  async execute(input: TInput, uid: string): Promise<VisionStreamResult> {
    const { imageBase64, prompt, systemPrompt } = await this.buildVisionPrompt(input);
    const stream = await this.aiService.chatWithVisionStream(
      imageBase64,
      prompt,
      this.getMaxTokens(),
      systemPrompt,
    );

    if (uid) {
      this.analysisRepo.updateStreak(uid).catch((e) => console.error('[BaseVisionUseCase] updateStreak failed:', e));
    }

    const onComplete = (full: string) => {
      if (uid) {
        this.analysisRepo.saveAnalysis(uid, this.toolId, full.substring(0, 1000)).catch((e) => console.error('[BaseVisionUseCase] saveAnalysis failed:', e));
      }
    };

    return { stream, onComplete };
  }

  protected getMaxTokens(): number {
    return 800;
  }

  protected abstract buildVisionPrompt(input: TInput): Promise<{ imageBase64: string; prompt: string; systemPrompt?: string }> | { imageBase64: string; prompt: string; systemPrompt?: string };
}
