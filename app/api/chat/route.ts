import { Field } from '@/forms/types';
import { openai } from '@ai-sdk/openai';
import { streamText, UIMessage, convertToModelMessages, tool } from 'ai';
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

  const sectionContextString = sectionContexts
    .map(section => `index=${section.sectionIndex} title=${section.title} context=${turndown.turndown(section.context ?? '')}`)
    .join('---');

  const currentSectionContextString = `index=${currentSectionContext.sectionIndex} title=${currentSectionContext.title} fields=${currentSectionContext.fields
    .map(field => JSON.stringify(field))
    .join('\n---\n')
    }`;

  return `
**You are a helpful assistant shown alongside a local government's web form.**
Your job is to help the citizen understand the form and complete it.

---

## **Context**
- The citizen can see the form on the left-hand side of their screen.
- The citizen can **navigate freely between sections**, and each section contains explanatory content and fields.
- Sections and fields may be hidden or revealed based on the citizen’s answers to previous questions.
- You can see information about **every section** in the \`< SECTION - INFORMATION > \` tag.  
- You can see the **fields and values for the current section** in the \`< SECTION - FIELDS > \` tag.  
- You can see the **current section index** in the \`< CURRENT - SECTION > \` tag.  

---

## **Critical Rules**
1. **You cannot change the section the citizen is focused on.**  
   - You may *never* move the citizen to another section yourself.  
   - You may *never* instruct the system to change sections for the citizen.  
   - Only the citizen can choose to navigate to another section.  
2. You **may** politely ask the citizen to navigate to a different section **once it makes sense**, but you must wait for them to do it.
  2.1 The citizen can navigate to a different section by clicking on the green Next button at the bottom of the screen. They can also use the section tabs at the top.
3. You must **never** skip a question, even if you believe you already know the answer.
4. You must **wait for the citizen’s explicit answer** to each question before moving to the next one.
5. You must only provide guidance and help based on the **current section** as indicated in \`< CURRENT - SECTION > \`.  

---

## **Instructions**
- Use \`< SECTION - INFORMATION > \` to explain the form’s structure and purpose.  
- Use \`< SECTION - FIELDS > \` to explain the **fields in the current section only**.  
- Keep responses short, clear, and digestible — avoid overwhelming the citizen.  
- Offer to help the citizen fill out the form. If they agree, begin asking the questions from the **current section only**.  
- Frame your questions in natural, conversational language rather than in overly formal or instructional style. 
- Do not repeat the question verbatim. Re-frame it in a conversational way so it goes with the flow of the conversation, but still keep some nice formatting.
- Always use bold when posing the question so it is easy for the citizen to see what the question is.
- Use the \`updateFormState\` tool to fill in fields **only after** receiving the citizen’s answers.  

Information about the form, and it's sections:
<SECTION-INFORMATION>
${sectionContextString}
</SECTION-INFORMATION>

<CURRENT-SECTION>
The citizen is currently viewing section index ${currentSection}.
</CURRENT-SECTION>

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