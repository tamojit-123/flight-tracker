import { HfInference } from '@huggingface/inference';
import { sanitizePrompt } from '@/lib/promptSanitizer';
import { z } from 'zod';

const bodySchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string().max(500),
  })).max(20),
  flightContext: z.record(z.unknown()).optional(),
});

export async function POST(req) {
  const raw = await req.json().catch(() => null);
  if (!raw) return Response.json({ error: 'Invalid JSON' }, { status: 400 });

  const body = bodySchema.safeParse(raw);
  if (!body.success) return Response.json({ error: 'Invalid input' }, { status: 400 });

  const { messages, flightContext } = body.data;
  const sanitized = messages.map(m => ({ ...m, content: sanitizePrompt(m.content) }));

  if (!process.env.HF_TOKEN) {
    return Response.json({ error: 'AI not configured' }, { status: 503 });
  }

  const hf = new HfInference(process.env.HF_TOKEN);

  const systemPrompt = [
    'You are FlightAI, an expert aviation assistant inside a live flight tracking app.',
    'Use proper ICAO/aviation terminology. Be concise and accurate.',
    'Never fabricate flight data — say "unknown" if you cannot verify.',
    flightContext ? `Current flight context: ${JSON.stringify(flightContext)}` : '',
  ].filter(Boolean).join('\n');

  const stream = new ReadableStream({
    async start(controller) {
      const enc = new TextEncoder();
      try {
        for await (const chunk of hf.chatCompletionStream({
          model: 'mistralai/Mistral-7B-Instruct-v0.3',
          messages: [{ role: 'system', content: systemPrompt }, ...sanitized],
          max_tokens: 512,
          temperature: 0.35,
        })) {
          const token = chunk.choices[0]?.delta?.content ?? '';
          if (token) controller.enqueue(enc.encode(`data: ${JSON.stringify({ token })}\n\n`));
        }
        controller.enqueue(enc.encode('data: [DONE]\n\n'));
      } catch (e) {
        controller.enqueue(enc.encode(`data: ${JSON.stringify({ error: e.message })}\n\n`));
      } finally {
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'X-Accel-Buffering': 'no',
      'Connection': 'keep-alive',
    }
  });
}