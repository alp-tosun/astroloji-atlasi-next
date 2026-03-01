import { chatStream, chatWithVisionStream } from '@/lib/openai/chat';
import type { IAIService, AIStream } from '@/domain/ports/ai-service';

export class AIServiceImpl implements IAIService {
  async chatStream(system: string, user: string, maxTokens = 800): Promise<AIStream> {
    return chatStream(system, user, undefined, maxTokens);
  }

  async chatWithVisionStream(imageBase64: string, prompt: string, maxTokens = 800, systemPrompt?: string): Promise<AIStream> {
    return chatWithVisionStream(imageBase64, prompt, undefined, maxTokens, systemPrompt);
  }
}
