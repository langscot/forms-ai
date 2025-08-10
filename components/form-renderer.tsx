"use client";

import { Form } from "@/forms/types";
import FormSection from "./form-section";
import Heading from "./ui/Heading";
import Paragraph from "./ui/Paragraph";
import Button from "./ui/Button";
import ServiceNavigation, { ServiceNavigationItem } from "./ui/ServiceNavigation";
import { evaluate } from "@/forms/conditions";

type FormRendererProps = {
  form: Form;
  currentSection: number;
  setCurrentSection: (section: number) => void;
  setState: (updater: (prevState: Record<string, unknown>) => Record<string, unknown>) => void;
  state: Record<string, unknown>;
  getNearestVisibleSectionIndex: (currentSection: number, direction: 'next' | 'previous') => number | undefined;
}

export default function FormRenderer({
  form,
  currentSection,
  setCurrentSection,
  state,
  setState,
  getNearestVisibleSectionIndex,
}: FormRendererProps) {
  return (
    <div>
      <Heading level={2}>{form.title}</Heading>
      <Paragraph>{form.description}</Paragraph>

      <ServiceNavigation className="mb-8">
        {form.sections.map((section, index) => (
          (section.displayCondition ? evaluate(section.displayCondition, state) : true) && (
            <ServiceNavigationItem key={section.id} active={currentSection === index} onClick={() => setCurrentSection(index)}>
              {section.title}
            </ServiceNavigationItem>
          )
        ))}
      </ServiceNavigation>

      <FormSection section={form.sections[currentSection]} state={state} setState={setState} />

      <div className="flex gap-2">
        <Button onClick={() => setCurrentSection(getNearestVisibleSectionIndex(currentSection, 'previous') ?? 0)} disabled={currentSection === 0} variant='secondary'>Previous</Button>
        <Button onClick={() => setCurrentSection(getNearestVisibleSectionIndex(currentSection, 'next') ?? 0)} disabled={currentSection === form.sections.length - 1}>Next</Button>
      </div>
    </div>
  );
}