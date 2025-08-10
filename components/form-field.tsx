'use client';

import { Field } from "@/forms/types";
import TextInput from "./ui/TextInput";
import NumberInput from "./ui/NumberInput";
import MarkdownBlock from "./ui/MarkdownBlock";
import { evaluate } from "@/forms/conditions";
import TextArea from "./ui/TextArea";
import DateInput, { DateParts } from "./ui/DateInput";
import Select, { SelectOption } from "./ui/Select";
import Radios from "./ui/Radios";
import Checkboxes from "./ui/Checkboxes";

type FormFieldProps = {
  field: Field;
  state: Record<string, unknown>;
  setState: (updater: (prevState: Record<string, unknown>) => Record<string, unknown>) => void;
}

export default function FormField({ field, state, setState }: FormFieldProps) {
  const isVisible =
    field.hidden ? false :
      field.displayCondition ? evaluate(field.displayCondition, state) : true;

  console.log(isVisible);

  if (!isVisible) {
    return null;
  }

  const value = state[field.dataName];
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setState((prevState: Record<string, unknown>) => ({ ...prevState, [field.dataName]: e.target.value }));
  }

  function renderField() {
    switch (field.type) {
      case 'text':
        return <TextInput hint={field.helpText} name={field.id} label={field.label} value={value as string} onChange={handleChange} />;
      case 'number':
        return <NumberInput hint={field.helpText} name={field.id} label={field.label} value={value as number} onChange={handleChange} />;
      case 'textarea':
        return <TextArea hint={field.helpText} name={field.id} label={field.label} value={value as string} onChange={handleChange} />;
      case 'date':
        return <DateInput hint={field.helpText} name={field.id} legend={field.label} defaultValue={value as DateParts} onChange={handleChange} />;
      case 'select':
        return <Select hint={field.helpText} name={field.id} label={field.label} value={value as string} defaultValue={value as string} onChange={handleChange} options={field.options as SelectOption[]} />;
      case 'radio':
        return <Radios hint={field.helpText} name={field.id} legend={field.label} value={value as string} onChange={handleChange} items={field.options.map(option => ({
          label: option.label,
          value: option.value,
          checked: value === option.value,
        }))} />;
      case 'checkbox':
        return <Checkboxes hint={field.helpText} name={field.id} legend={field.label} value={value as string} onChange={handleChange} items={field.options.map(option => ({
          label: option.label,
          value: option.value,
          checked: value === option.value,
        }))} />;
      case 'staticText':
        return <MarkdownBlock html={field.content} />;
      case 'html':
        return <MarkdownBlock html={field.content} />;
    }
  }

  return <>
    {/* <span className="text-sm text-gray-500">Visible: {isVisible ? 'true' : 'false'}</span><br />
    <span className="text-sm text-gray-500">Display Condition: {field.displayCondition}</span> */}
    {renderField()}
  </>
}