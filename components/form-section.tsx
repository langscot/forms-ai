'use client';

import { Section } from "@/forms/types";
import Heading from "./ui/Heading";
import FormField from "./form-field";

type FormSectionProps = {
  section: Section;
  state: Record<string, unknown>;
  setState: (updater: (prevState: Record<string, unknown>) => Record<string, unknown>) => void;
}

export default function FormSection({ section, state, setState }: FormSectionProps) {
  return (
    <div>
      <Heading level={3}>{section.title}</Heading>
      {section.fields.map((field) => (
        <FormField key={field.id} field={field} state={state} setState={setState} />
      ))}
    </div>
  );
}