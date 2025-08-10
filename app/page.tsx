import AnchorLink from "@/components/ui/AnchorLink";
import Details from "@/components/ui/Details";
import Heading from "@/components/ui/Heading";
import Paragraph from "@/components/ui/Paragraph";
import SummaryList, { SummaryListItem } from "@/components/ui/SummaryList";
import { getExampleForms } from "@/lib/actions";

export default async function Home() {
  const forms = await getExampleForms();

  return (
    <div className="h-screen max-h-screen container mx-auto max-w-2xl py-12 px-4">
      <Heading>Forms & AI</Heading>
      <Paragraph>This experiment asks: Can AI make forms easier to complete?</Paragraph>

      <Details title="How?">
        <Paragraph>The AI assistant here can:</Paragraph>
        <ul className="govuk-list govuk-list--bullet">
          <li>Talk someone through the form step-by-step</li>
          <li>
            Explain complicated questions in terms that relate to the user's previous answers and conversation history
          </li>
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
  );
}
