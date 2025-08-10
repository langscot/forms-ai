export type Form = {
  title: string;
  description?: string;
  sections: Section[];
}

export type DisplayCondition = string;
export type ValidationCondition = string;
export type ReadOnlyCondition = string;
export type RequiredCondition = string;

export type Section = {
  id: string;
  title: string;
  displayCondition?: DisplayCondition;
  fields: Field[];
}

export type FieldType =
  | 'staticText'
  | 'html'
  | 'text'
  | 'radio'
  | 'number'
  | 'checkbox'
  | 'textarea'
  | 'autoLookup'
  | 'subform'
  | 'date'
  | 'select'

export type BaseField = {
  id: string;
  type: FieldType;
  hidden?: boolean;
  label: string;
  dataName: string;
  displayCondition?: DisplayCondition;
}

export type BaseInputField = BaseField & {
  helpText?: string;
  defaultValue?: string;
  readOnly?: boolean;
  validationCondition?: ValidationCondition;
  readOnlyCondition?: ReadOnlyCondition;
  requiredCondition?: RequiredCondition;
  required?: boolean;
}

export type StaticTextField = BaseField & {
  type: 'staticText';
  content: string;
}

export type HtmlField = BaseField & {
  type: 'html';
  content: string;
}

export type TextField = BaseInputField & {
  type: 'text';
  minimumLength?: string;
  maximumLength?: string;
}

export type RadioField = BaseInputField & {
  type: 'radio';
  defaultType: 'specific';
  defaultValue?: string;
  allowOther?: boolean;
  options: {
    label: string;
    value: string;
  }[]
  displayStyle: 'vertical' | 'horizontal';
}

export type NumberField = BaseInputField & {
  type: 'number';
  minimumValue?: number;
  maximumValue?: number;
}

export type CheckboxField = BaseInputField & {
  type: 'checkbox';
  defaultType: 'specific';
  defaultValue?: string;
  displayStyle: 'vertical' | 'horizontal';
  minimumChoices?: number;
  maximumChoices?: number;
  options: {
    label: string;
    value: string;
  }[]
}

export type TextAreaField = BaseInputField & {
  type: 'textarea';
  minimumLength?: string;
  maximumLength?: string;
}

export type DateField = BaseInputField & {
  type: 'date';
}

export type SelectField = BaseInputField & {
  defaultType: 'specific';
  allowMultiple: boolean;
  minimumChoices?: number;
  maximumChoices?: number;
  selectLabel?: string;
  type: 'select';
  isDynamic: boolean;
  options?: {
    label: string;
    value: string;
  }[],
  allowOther?: boolean;
}

export type Field = StaticTextField | HtmlField | TextField | RadioField | NumberField | CheckboxField | TextAreaField | DateField | SelectField;