'use client';

import Chat from "@/components/chat";
import FormRenderer from "@/components/form-renderer";
import { getExampleForm } from "@/lib/actions";
import { Field, Form } from "@/forms/types";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { evaluate } from "@/forms/conditions";
import { createFormState } from "@/forms/utils";
import { useMediaQuery } from "usehooks-ts";
import AnchorLink from "@/components/ui/AnchorLink";
import { Turnstile } from "@marsidev/react-turnstile";

export default function Demo() {
  const searchParams = useSearchParams();
  const [form, setForm] = useState<Form | null>(null);
  const [currentSection, setCurrentSection] = useState(0);
  const [state, setState] = useState<Record<string, unknown>>({});
  const isMobile = useMediaQuery('(max-width: 1024px)');
  const [cfToken, setCfToken] = useState('');

  // Load the form :)
  useEffect(() => {
    getExampleForm(searchParams.get('form') || 'Council Tax Reduction').then((form) => {
      if (form) {
        setForm(form);
        setState(createFormState(form));
      }
    });
  }, [searchParams]);

  // Used to properly go back/forward between sections, taking into account display conditions
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

  // Sekeleton loading state
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
    <div className="grid grid-cols-1 lg:grid-cols-12">
      <div className="col-span-1 lg:col-span-8 p-6 lg:pt-6 pb-32 lg:px-12">
        <AnchorLink href="/" className="mb-6 block">Back to home</AnchorLink>
        <FormRenderer
          form={form}
          currentSection={currentSection}
          setCurrentSection={setCurrentSection}
          state={state}
          setState={setState}
          getNearestVisibleSectionIndex={getNearestVisibleSectionIndex}
        />
      </div>
      <aside className="lg:block lg:col-span-4 lg:sticky lg:top-0 lg:h-dvh">
        <Chat
          isWidget={isMobile}
          setState={setState}
          body={{
            formName: form.title,
            currentSectionIndex: currentSection,
            formState: state
          }}
          cfToken={cfToken}
        />
        <Turnstile
          siteKey={process.env.NEXT_PUBLIC_CF_SITE_KEY!}
          onSuccess={setCfToken}
        />
      </aside>
    </div>
  );
}