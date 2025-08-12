import { BaseField, BaseInputField, CheckboxField, DateField, DisplayCondition, Field, FieldType, Form, HtmlField, NumberField, RadioField, ReadOnlyCondition, RequiredCondition, Section, SelectField, StaticTextField, TextAreaField, TextField, ValidationCondition } from "./types";
import fs from 'fs';

function isValidFieldType(type: string): type is FieldType {
  return type === 'staticText' || type === 'html' || type === 'text' || type === 'radio' || type === 'number' || type === 'checkbox' || type === 'textarea' || type === 'date' || type === 'select' || type === 'subform' || type === 'upload' || type === 'button' || type === 'autoLookup';
}

function isValidBaseInputFieldType(type: string): type is FieldType {
  return type === 'text' || type === 'number' || type === 'radio' || type === 'checkbox' || type === 'textarea' || type === 'date' || type === 'select';
}

function isNoOpFieldType(type: string): type is FieldType {
  return type === 'autoLookup' || type === 'subform' || type === 'upload' || type === 'button';
}

const subformStubs = {
  'Address entry: All in One v1.1': {
    type: 'textarea',
    label: 'Address',
  },
}

function parseField(fieldObject: Record<string, unknown>): Field | null {
  const type = fieldObject.type as string;

  if (!isValidFieldType(type)) {
    throw new Error(`Invalid field type: ${type}`);
  }

  const props = fieldObject.props as Record<string, unknown>;

  const baseField: BaseField = {
    id: fieldObject.id as string,
    type: fieldObject.type as FieldType,
    label: props.label as string,
    dataName: props.dataName as string,
    hidden: props.hidden as boolean,
    displayCondition: props.displayCondition as DisplayCondition,
  }

  // Swap out sub-forms with simple stubs for now. This is a manual process to identify sub-form names and replace with a suitable stub (see subformStubs)
  if (type === 'subform') {
    const formName = (props.formName as string);
    const stub = subformStubs[formName as keyof typeof subformStubs];
    if (stub) {
      return {
        ...baseField,
        ...stub,
      } as Field;
    } else {
      console.warn(`No stub found for subform ${formName}`);
      return null;
    }
  }

  // Don't process lookup fields
  const lookup = props.lookup as string | null;
  if (typeof lookup === 'string') {
    return null;
  }

  if (isNoOpFieldType(type)) return null;

  const baseInputField: Omit<BaseInputField, keyof BaseField> = isValidBaseInputFieldType(type) ? {
    helpText: props.helpText as string,
    defaultValue: props.defaultValue as string,
    readOnly: props.readOnly as boolean,
    validationCondition: props.validationCondition as ValidationCondition,
    required: props.mandatory as boolean,
    readOnlyCondition: props.readOnlyCondition as ReadOnlyCondition,
    requiredCondition: props.requiredCondition as RequiredCondition,
  } : {};

  switch (type) {
    case 'staticText':
      return {
        ...baseField,
        content: props.content as string,
      } as StaticTextField;
    case 'html':
      return {
        ...baseField,
        content: props.content as string,
      } as HtmlField;
    case 'text':
      return {
        ...baseField,
        ...baseInputField,
      } as TextField;
    case 'number':
      return {
        ...baseField,
        ...baseInputField,
        minimumValue: Number(props.minimumValue),
        maximumValue: Number(props.maximumValue),
      } as NumberField;
    case 'radio':
      return {
        ...baseField,
        ...baseInputField,
        allowOther: props.allowOther as boolean,
        options: props.listOfValues as { label: string; value: string }[],
        displayStyle: props.displayStyle as 'vertical' | 'horizontal',
      } as RadioField;
    case 'checkbox':
      return {
        ...baseField,
        ...baseInputField,
        defaultType: props.defaultType as 'specific',
        displayStyle: props.displayStyle as 'vertical' | 'horizontal',
        options: props.listOfValues as { label: string; value: string }[],
      } as CheckboxField;
    case 'textarea':
      return {
        ...baseField,
        ...baseInputField,
        minimumLength: props.minimumLength as string,
        maximumLength: props.maximumLength as string,
      } as TextAreaField;
    case 'date':
      return {
        ...baseField,
        ...baseInputField,
      } as DateField;
    case 'select':
      return {
        ...baseField,
        ...baseInputField,
        defaultType: props.defaultType as 'specific',
        allowMultiple: props.allowMultiple as boolean,
        minimumChoices: Number(props.minimumChoices),
        maximumChoices: Number(props.maximumChoices),
        selectLabel: props.selectLabel as string,
        isDynamic: props.lookup !== null,
        options: props.lookup === null ? props.listOfValues as { label: string; value: string }[] : undefined,
      } as SelectField;
    default:
      return null;
  }
}

function parseSection(sectionObject: Record<string, unknown>): Section {
  let fields: Field[] = [];

  // Process each field sequentially, if one errors then skip it & continue
  for (const fieldObject of sectionObject.fields as Record<string, unknown>[]) {
    try {
      const field = parseField(fieldObject);
      if (field) fields.push(field);
    } catch (error) {
      console.error(`Error parsing field ${fieldObject.id}: ${error}`);
    }
  }

  return {
    id: sectionObject.id as string,
    title: sectionObject.name as string,
    displayCondition: (sectionObject.props as Record<string, unknown>)?.displayCondition as DisplayCondition,
    fields,
  }
}

export function parseFirmstepJson(object: Record<string, unknown>): Form {
  const form: Form = {
    title: object.formName as string,
    description: object.formDescription as string,
    sections: [],
  }

  for (const sectionObject of object.sections as Record<string, unknown>[]) {
    const section = parseSection(sectionObject);
    form.sections.push(section);
  }

  return form;
}

// Used for debugging
if (require.main === module) {
  const json = fs.readFileSync('example_forms/council_tax_reduction.json', 'utf8');
  const object = JSON.parse(json);
  const form = parseFirmstepJson(object);
  console.log(form);
}
