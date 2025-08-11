import TurndownService from "turndown";
import { getExampleForm } from "./actions";
import evaluate from "@/forms/conditions";

export async function createPrompt({ formName, currentSectionIndex, formState }: {
  formName: string,
  currentSectionIndex: number,
  formState: Record<string, unknown>
}) {
  const form = await getExampleForm(formName);
  const td = new TurndownService();

  // Get only visible sections based on form state
  const visibleSections = form?.sections.filter(section => section.displayCondition ? evaluate(section.displayCondition, formState) : true);
  const visibleSectionsString = visibleSections?.map(section => {
    const textBasedFields = section.fields.filter(field => field.type === 'html').map(field => field.content).join('\n');
    const markdown = td.turndown(textBasedFields);
    return `
      ### ${section.title}
      ${markdown}
    `
  }).join('\n---\n');

  const shortKeys = {
    type: 't',
    hidden: 'h',
    label: 'l',
    dataName: 'dn',
    helpText: 'ht',
    readOnly: 'ro',
    required: 'r',
    content: 'c',
    minimumLength: 'minl',
    maximumLength: 'maxl',
    minimumValue: 'minv',
    maximumValue: 'maxv',
    minimumChoices: 'minc',
    maximumChoices: 'maxc',
    options: 'o',
    allowOther: 'ao',
    allowMultiple: 'am',
    selectLabel: 'sl',
  }

  // Get only visible fields for current section
  const visibleFields = form?.sections[currentSectionIndex].fields.filter(field => field.displayCondition ? evaluate(field.displayCondition, formState) : true);
  const visibleFieldsString = visibleFields?.map(field => {
    const fieldString = Object.entries(field).map(([key, value]) => {
      if (key === 'options') {
        return `${shortKeys.options}="${(value as { label: string, value: string }[]).map(option => option.label).join(',')}"`;
      }
      if (shortKeys[key as keyof typeof shortKeys]) {
        return `${shortKeys[key as keyof typeof shortKeys]}=${value}`;
      }
      return '';
    })
      .filter(Boolean)
      .join(', ');
    return fieldString;
  }).join('\n');

  return `
**You are a helpful assistant shown alongside a local government's web form.**
Your job is to help the citizen understand the form and complete it.

---

## **Context**
- The citizen can see the form on the left-hand side of their screen.
- The citizen can **navigate freely between sections**, and each section contains explanatory content and fields.
- Sections and fields may be hidden or revealed based on the citizen’s answers to previous questions.
- You can see information about **every section** in the \`<SECTION-INFORMATION> \` tag.  
- You can see the **fields and values for the current section** in the \`<SECTION-FIELDS> \` tag.  
- You can see the **current section index** in the \`<CURRENT-SECTION> \` tag.  

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
5. You must only provide guidance and help based on the **current section** as indicated in \`<CURRENT-SECTION>\`.  

---

## **Instructions**
- Use \`<SECTION-INFORMATION> \` to explain the form’s structure and purpose.  
- Use \`<SECTION-FIELDS> \` to explain the **fields in the current section only**.  
- Keep responses short, clear, and digestible — avoid overwhelming the citizen.  
- Offer to help the citizen fill out the form. If they agree, begin asking the questions from the **current section only**.  
- Frame your questions in natural, conversational language rather than in overly formal or instructional style. 
- Do not repeat the question verbatim. Re-frame it in a conversational way so it goes with the flow of the conversation, but still keep some nice formatting.
- Always use bold when posing the question so it is easy for the citizen to see what the question is.
- Use the \`updateFormState\` tool to fill in fields **only after** receiving the citizen’s answers.  

SECTION-INFORMATION contains each section heading and the relevant text-based information within it.

<SECTION-INFORMATION>
${visibleSectionsString}
</SECTION-INFORMATION>

CURRENT-SECTION is the title of the section the citizen is currently viewing.

<CURRENT-SECTION>
${form?.sections[currentSectionIndex].title}
</CURRENT-SECTION>

SECTION-FIELDS contains the fields and values for the current section. Use the key:
${Object.entries(shortKeys).map(([key, value]) => `${key}=${value}`).join(', ')}

<SECTION-FIELDS>
${visibleFieldsString}
</SECTION-FIELDS>
`;
}