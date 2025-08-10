'use server';

import { parseFirmstepJson } from '@/forms/parse';
import fs from 'fs';
import path from 'path';

const exampleFormsDir = path.join(process.cwd(), 'example_forms');

// Load all JSON files in the forms directory
const exampleForms = fs.readdirSync(exampleFormsDir).map((file) => {
  const json = fs.readFileSync(path.join(exampleFormsDir, file), 'utf8');
  const form = parseFirmstepJson(JSON.parse(json));
  return form;
});

export async function getExampleForms() {
  return exampleForms.map(form => ({
    title: form.title,
    description: form.description,
  }));
}

export async function getExampleForm(title: string) {
  return exampleForms.find(form => form.title === title);
}