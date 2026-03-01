import { openai } from './client';

const DEFAULT_MODEL = 'gpt-4.1';
const DEFAULT_TIMEOUT = 60_000; // 60 seconds

export async function chat(
  system: string,
  user: string,
  model = DEFAULT_MODEL,
  maxTokens = 800,
): Promise<string> {
  const r = await openai.chat.completions.create({
    model,
    max_tokens: maxTokens,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
  }, { timeout: DEFAULT_TIMEOUT });
  return r.choices[0].message.content ?? '';
}

export async function chatStream(
  system: string,
  user: string,
  model = DEFAULT_MODEL,
  maxTokens = 800,
) {
  return openai.chat.completions.create({
    model,
    max_tokens: maxTokens,
    stream: true,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
  }, { timeout: DEFAULT_TIMEOUT });
}

export async function chatWithVision(
  imageBase64: string,
  textPrompt: string,
  model = DEFAULT_MODEL,
  maxTokens = 800,
  systemPrompt?: string,
): Promise<string> {
  const messages: Parameters<typeof openai.chat.completions.create>[0]['messages'] = [];
  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }
  messages.push({
    role: 'user',
    content: [
      { type: 'image_url', image_url: { url: imageBase64, detail: 'low' } },
      { type: 'text', text: textPrompt },
    ],
  });
  const r = await openai.chat.completions.create({
    model,
    max_tokens: maxTokens,
    messages,
  }, { timeout: DEFAULT_TIMEOUT });
  return r.choices[0].message.content ?? '';
}

export async function chatWithVisionStream(
  imageBase64: string,
  textPrompt: string,
  model = DEFAULT_MODEL,
  maxTokens = 800,
  systemPrompt?: string,
) {
  const messages: Parameters<typeof openai.chat.completions.create>[0]['messages'] = [];
  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }
  messages.push({
    role: 'user',
    content: [
      { type: 'image_url', image_url: { url: imageBase64, detail: 'low' } },
      { type: 'text', text: textPrompt },
    ],
  });
  return openai.chat.completions.create({
    model,
    max_tokens: maxTokens,
    stream: true,
    messages,
  }, { timeout: DEFAULT_TIMEOUT });
}
