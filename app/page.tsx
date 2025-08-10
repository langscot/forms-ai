import Chat from "@/components/chat";
import AnchorLink from "@/components/ui/AnchorLink";
import Details from "@/components/ui/Details";
import Heading from "@/components/ui/Heading";
import Paragraph from "@/components/ui/Paragraph";
import SummaryList, { SummaryListItem } from "@/components/ui/SummaryList";
import { getExampleForms } from "@/lib/actions";
import Link from "next/link";

export default async function Home() {
  const forms = await getExampleForms();

  return (
    <div className="grid grid-cols-12 h-screen max-h-screen">
      <div className="col-span-12 md:col-span-8 p-12">
        <Heading>Forms & AI</Heading>
        <Paragraph>I like forms.</Paragraph>

        <Details title="Why?">
          <Paragraph>
            Forms are great at capturing information. When they’re well-designed, they can check that information as you type, guide people down different paths based on their circumstances, and sometimes even give instant decisions.
          </Paragraph>
        </Details>

        <Paragraph>
          But… forms can get long. Really long. They can be full of text, instructions, and complex questions. Sometimes it’s enough to make someone give up before they even start.
        </Paragraph>

        <Paragraph>This experiment asks:</Paragraph>
        <Paragraph>Can AI make forms easier to handle?</Paragraph>

        <Details title="How?">
          <Paragraph>The AI assistant here can:</Paragraph>
          <ul className="govuk-list govuk-list--bullet">
            <li>Talk someone through the form step-by-step</li>
            <li>Answer questions in plain language</li>
            <li>
              Suggest likely answers based on earlier responses (e.g., if someone says they’re unemployed and live alone, it might suggest they’re not married)
            </li>
          </ul>
        </Details>

        <Paragraph>
          This site is just a technology demo. It’s not connected to any real services. It’s designed to help explore what’s possible when online forms and AI work together.
        </Paragraph>

        <Paragraph>Try it out:</Paragraph>
        <Paragraph>Pick an example form below and see the form + AI assistant in action.</Paragraph>

        <Heading level={2}>Example forms</Heading>

        <SummaryList>
          {forms.map((form) => (
            <SummaryListItem key={form.title} label={form.title} value={form.description || 'No description'} actions={
              <AnchorLink href={`/demo?form=${form.title}`}>View</AnchorLink>
            } />
          ))}
        </SummaryList>
      </div>
      <div className="col-span-12 md:col-span-4 h-full max-h-full min-h-0">
        <Chat />
      </div>
    </div>
  );
}
