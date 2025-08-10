'use client';

import Chat from "@/components/chat";
import FormRenderer from "@/components/form-renderer";
import { getExampleForm } from "@/lib/actions";
import { Field, Form } from "@/forms/types";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { evaluate } from "@/forms/conditions";
import { createFormState } from "@/forms/utils";

export default function Demo() {
  const searchParams = useSearchParams();
  const [form, setForm] = useState<Form | null>(null);
  const [currentSection, setCurrentSection] = useState(0);
  const [state, setState] = useState<Record<string, unknown>>({});

  // Load the form :)
  useEffect(() => {
    getExampleForm(searchParams.get('form') || 'Council Tax Reduction').then((form) => {
      if (form) {
        setForm(form);
        setState(createFormState(form));
        console.debug(form);
      }
    });
  }, [searchParams]);

  const getNearestVisibleSectionIndex = useCallback((currentSection: number, direction: 'next' | 'previous') => {
    const dir = direction === 'next' ? 1 : -1;
    let i = currentSection + dir;
    while (i >= 0 && i < (form?.sections.length ?? 0)) {
      if (form?.sections[i].displayCondition) {
        if (evaluate(form?.sections[i].displayCondition ?? '', state)) {
          return i;
        }
      } else {
        return i;
      }
      i += dir;
    }
    return currentSection;
  }, [form, state]);

  const getVisibleFieldsInSection = useCallback((sectionIndex: number) => {
    return form?.sections[sectionIndex].fields.filter((field: Field) => field.displayCondition ? evaluate(field.displayCondition, state) : true);
  }, [state, form]);

  const getSectionContexts = () => {
    return form?.sections.map((section, index) => ({
      sectionIndex: index,
      title: section.title,
      context: section.fields.filter(field => field.type === 'html' || field.type === 'staticText').map(field => field.content).join('\n')
    }))
  }

  const currentSectionContext = useMemo(() => {
    return {
      sectionIndex: currentSection,
      title: form?.sections[currentSection].title ?? '',
      fields: (getVisibleFieldsInSection(currentSection) ?? []).map((field: Field) => ({
        ...field,
        value: state[field.dataName] as string
      }))
    }
  }, [currentSection, form, getVisibleFieldsInSection, state]);

  if (!form) {
    return (
      <div className="w-full h-full flex p-12">
        <div className="w-full max-w-xl space-y-6">
          <div className="h-8 bg-gray-200 rounded animate-pulse" />
          <div className="h-6 bg-gray-200 rounded animate-pulse w-2/3" />
          <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
          <div className="h-12 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3" />
          <div className="h-8 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-12">
      <div className="col-span-1 md:col-span-8 p-6 md:p-12">
        <FormRenderer
          form={form}
          currentSection={currentSection}
          setCurrentSection={setCurrentSection}
          state={state}
          setState={setState}
          getNearestVisibleSectionIndex={getNearestVisibleSectionIndex}
        />
      </div>
      <aside className="col-span-1 md:col-span-4 md:sticky md:top-0 md:h-dvh">
        <Chat
          sectionContexts={getSectionContexts() ?? []}
          currentSection={currentSection}
          currentSectionContext={currentSectionContext}
          setState={setState}
        />
      </aside>
    </div>
  );
}
