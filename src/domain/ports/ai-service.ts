import type { Stream } from 'openai/streaming';
import type { ChatCompletionChunk } from 'openai/resources/chat/completions';

export type AIStream = Stream<ChatCompletionChunk>;

export interface IAIService {
  chatStream(system: string, user: string, maxTokens?: number): Promise<AIStream>;
  chatWithVisionStream(imageBase64: string, prompt: string, maxTokens?: number): Promise<AIStream>;
}
