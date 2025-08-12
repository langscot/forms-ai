import { openai } from '@ai-sdk/openai';
import { streamText, UIMessage, convertToModelMessages, tool } from 'ai';
import { z } from 'zod';
import { validateTurnstile } from '@/lib/turnstile';
import { NextResponse } from 'next/server';
import { createPrompt } from '@/lib/prompt';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const {
    messages,
    token,
    formName,
    currentSectionIndex,
    formState
  }: {
    messages: UIMessage[],
    token: string,
    formName: string,
    currentSectionIndex: number,
    formState: Record<string, unknown>
  } = await req.json();

  // Cloudflare verification
  if (process.env.CLOUDFLARE_TURNSTILE_ENABLED === 'true') {
    const validationResponse = await validateTurnstile(token);
    console.log(validationResponse);
    if (!validationResponse.success) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
    }
  }

  const prompt = await createPrompt({ formName, currentSectionIndex, formState });

  const result = streamText({
    model: openai('gpt-4o-mini'),
    messages: convertToModelMessages(messages),
    system: prompt,
    tools: {
      updateFormState: tool({
        description: 'Update the form state with a new value. Use field dataName (dn) as the key',
        inputSchema: z.object({
          dataName: z.string(),
          value: z.string()
        })
      })
    }
  });

  return result.toUIMessageStreamResponse({
    originalMessages: messages,
    messageMetadata: ({ part }) => {
      if (part.type === 'start') {
        return {
          createdAt: Date.now()
        }
      }

      if (part.type === 'finish') {
        return {
          totalTokens: part.totalUsage.totalTokens
        }
      }
    }
  });
}