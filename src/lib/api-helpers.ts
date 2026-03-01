import { NextRequest, NextResponse } from 'next/server';
import { ZodSchema, ZodError } from 'zod';
import type { Stream } from 'openai/streaming';
import type { ChatCompletionChunk } from 'openai/resources/chat/completions';

export function apiSuccess<T>(result: T) {
  return NextResponse.json({ ok: true, result });
}

export function apiError(error: string, status = 500) {
  return NextResponse.json({ ok: false, error }, { status });
}

export async function parseAndValidate<T>(
  req: NextRequest,
  schema: ZodSchema<T>,
): Promise<{ data: T } | { error: NextResponse }> {
  try {
    const body = await req.json();
    const data = schema.parse(body);
    return { data };
  } catch (e) {
    if (e instanceof ZodError) {
      const msg = e.errors.map((err) => err.message).join(', ');
      return { error: apiError(msg, 400) };
    }
    return { error: apiError('Geçersiz istek.', 400) };
  }
}

export function streamResponse(stream: Stream<ChatCompletionChunk>, onComplete?: (fullText: string) => void) {
  const encoder = new TextEncoder();

  const readable = new ReadableStream({
    async start(controller) {
      let full = '';
      try {
        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content ?? '';
          if (text) {
            full += text;
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text, full })}\n\n`));
          }
        }
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true, full })}\n\n`));
        controller.close();
        if (onComplete) onComplete(full);
      } catch (e) {
        console.error('Stream error:', e);
        // If we have partial content, send it as done so user still sees something
        if (full.length > 0) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true, full: full + '\n\n---\n*(Yanıt tamamlanamadı)*' })}\n\n`));
        } else {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: 'Yapay zeka yanıt üretemedi.' })}\n\n`));
        }
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}

export function withErrorHandler(
  handler: (req: NextRequest) => Promise<NextResponse>,
) {
  return async (req: NextRequest) => {
    try {
      return await handler(req);
    } catch (e) {
      console.error('API Error:', e);
      const message = e instanceof Error ? e.message : 'Bilinmeyen hata.';
      return apiError(message);
    }
  };
}
