import type { IAIService, AIStream } from '@/domain/ports/ai-service';
import type { IAnalysisRepository } from '@/domain/ports/analysis-repository';
import type { ICacheRepository } from '@/domain/ports/cache-repository';
import type { PromptPair } from '@/domain/entities/prompt-pair';

export interface CachedStreamResult {
  stream: AIStream;
  onComplete: (full: string) => void;
}

export interface CachedResult {
  cached: string;
}

export type CachedUseCaseResult = CachedStreamResult | CachedResult;

// In-flight request lock to prevent duplicate AI calls for same cache key
const inFlight = new Map<string, Promise<CachedUseCaseResult>>();

export abstract class BaseCachedAIUseCase<TInput> {
  constructor(
    protected aiService: IAIService,
    protected cacheRepo: ICacheRepository,
    protected analysisRepo?: IAnalysisRepository,
    protected toolId?: string,
  ) {}

  async execute(input: TInput, uid: string): Promise<CachedUseCaseResult> {
    const cacheKey = this.getCacheKey(input, uid);
    const cached = await this.cacheRepo.get(this.getCollection(), cacheKey);
    if (cached) return { cached };

    // Prevent concurrent requests from generating duplicate content
    const lockKey = `${this.getCollection()}:${cacheKey}`;
    const existing = inFlight.get(lockKey);
    if (existing) return existing;

    const promise = this.generateAndCache(input, uid, cacheKey, lockKey);
    inFlight.set(lockKey, promise);
    return promise;
  }

  private async generateAndCache(
    input: TInput, uid: string, cacheKey: string, lockKey: string,
  ): Promise<CachedUseCaseResult> {
    const prompt = await this.buildPrompt(input);
    const stream = await this.aiService.chatStream(
      prompt.systemPrompt,
      prompt.userPrompt,
      prompt.maxTokens,
    );

    const onComplete = (full: string) => {
      inFlight.delete(lockKey);
      const content = this.transformForCache(full, input);
      this.cacheRepo.set(this.getCollection(), cacheKey, {
        content,
        createdAt: new Date().toISOString(),
      }).catch(() => {});

      if (uid && this.analysisRepo && this.toolId) {
        this.analysisRepo.saveAnalysis(uid, this.toolId, full.substring(0, 1000)).catch(() => {});
        this.analysisRepo.updateStreak(uid).catch(() => {});
      }
    };

    return { stream, onComplete };
  }

  protected transformForCache(full: string, _input: TInput): string {
    return full;
  }

  protected abstract getCacheKey(input: TInput, uid: string): string;
  protected abstract getCollection(): string;
  protected abstract buildPrompt(input: TInput): Promise<PromptPair> | PromptPair;
}
