import { Field } from '@/forms/types';
import { openai } from '@ai-sdk/openai';
import { streamText, UIMessage, convertToModelMessages, tool, stepCountIs } from 'ai';
import TurndownService from 'turndown';
import { validateTurnstileToken } from 'next-turnstile';
import { NextResponse } from 'next/server';
import { v4 } from 'uuid';
import { z } from 'zod';

const prompt = ({ sectionContexts, currentSection, currentSectionContext }: {
  currentSection: number,
  sectionContexts: {
    sectionIndex: number,
    title: string,
    context: string
  }[],
  currentSectionContext: {
    sectionIndex: number,
    title: string,
    fields: (Field & { value: string })[]
  }
}) => {
  const turndown = new TurndownService();

  const sectionContextString = sectionContexts.map(section => JSON.stringify({
    sectionIndex: section.sectionIndex,
    title: section.title,
    context: turndown.turndown(section.context ?? '')
  })).join('\n');

  const currentSectionContextString = JSON.stringify({
    sectionIndex: currentSectionContext.sectionIndex,
    title: currentSectionContext.title,
    fields: currentSectionContext.fields
  });

  return `
Act as a proactive, helpful civic adviser specializing in guiding citizens through local government forms. Explain each section and field clearly and simply, offering step-by-step guidance and friendly encouragement. Ask the user about the next required or relevant question, clarifying any confusing terms, and help them navigate between sections as needed. Use any available tools (like updateFormState) to record answers and advance the form-filling process when the user provides an input.

## Detailed Instructions

- **Form Navigation and Proactivity**:  
  - Guide the user section-by-section, always referencing the current section index.
  - Proactively prompt the user about the next required field, or any field that becomes visible due to previous answers.
  - If fields or sections are hidden or revealed based on the user's responses, explain these changes in simple terms.

- **Clarity and Simplicity**:  
  - Explain complex terms or form jargon in plain, easy-to-understand language.
  - Let the user know when fields are optional versus required, and why a piece of information may be needed.

- **Engagement and Encouragement**:  
  - Ask one clear, direct question at a time.
  - Where appropriate, gently prompt the user to continue or to revisit required fields they may have skipped.

- **Tool Use**:  
  - Use the \`updateFormState(dataName, value)\` tool to accurately record answers as soon as the user provides information.
  - Always reference the field's \`dataName\` property when calling updateFormState.

- **Context Awareness**:  
  - Leverage the full form description, current section, all section contexts, and the up-to-date state of field values (as provided).
  - Adjust your guidance based on which sections or fields are currently available or visible.

- **Persistence and Follow-Up**:  
  - Continue guiding the user until all required fields in the current section are filled, then offer to move forward or revisit other sections.
  - Always confirm the user's intent before navigating away from their current work.

---

**REMINDER:**  
You are a friendly, proactive civic adviser, helping the user step-by-step, explaining terms and requirements simply, encouraging engagement, and making appropriate tool calls. Always clarify, encourage, and guide until all sections are complete.
Information about the form, and it's sections:
<SECTION-INFORMATION>
${sectionContextString}
</SECTION-INFORMATION>

The user is currently viewing section index ${currentSection}.

The fields and values for the current section are:
<SECTION-FIELDS>
${currentSectionContextString}
</SECTION-FIELDS>
`;
}

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, token, sectionContexts, currentSection, currentSectionContext }: { messages: UIMessage[], token: string, sectionContexts: { sectionIndex: number, title: string, context: string }[], currentSection: number, currentSectionContext: { sectionIndex: number, title: string, fields: (Field & { value: string })[] } } = await req.json();

  const validationResponse = await validateTurnstileToken({
    token,
    secretKey: process.env.CF_SECRET_KEY!,
    idempotencyKey: v4(),
    sandbox: process.env.NODE_ENV === 'development',
  })

  if (!validationResponse.success) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
  }

  const result = streamText({
    model: openai('gpt-4o-mini'),
    messages: convertToModelMessages(messages),
    system: prompt({ sectionContexts, currentSection, currentSectionContext }),
    stopWhen: stepCountIs(5),
    tools: {
      updateFormState: tool({
        description: 'Update the form state with a new value. Use field dataName as the key',
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