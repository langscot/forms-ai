import { BaseInputField, Form } from "./types"
import { evaluateDefaultExpression } from "./expressions";

// Takes in a form object and creates a "state" object where each key is a fieldDataname, initialized to defaultValue
export const createFormState = (form?: Form | null) => {
  const state: Record<string, unknown> = {};

  if (!form) {
    return state;
  }

  form.sections.forEach((section) => {
    section.fields.forEach((field) => {
      const defaultValue = (field as BaseInputField).defaultValue ? evaluateDefaultExpression((field as BaseInputField).defaultValue as string, state) : '';
      state[field.dataName] = defaultValue;
      if (field.type === 'select') {
        state[field.dataName] = field.allowMultiple ? (Array.isArray(defaultValue) ? defaultValue : [defaultValue]) : (Array.isArray(defaultValue) ? defaultValue[0] : defaultValue);
      }
    });
  });

  return state;
}