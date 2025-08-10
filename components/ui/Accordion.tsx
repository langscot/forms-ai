"use client";

import { useEffect } from 'react';

export default function Accordion({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    import('govuk-frontend')
      .then(({ createAll, Accordion }) => {
        createAll(Accordion);
      });
  }, []);

  return <div className="govuk-accordion" data-module="govuk-accordion" id="accordion-default">
    {children}
  </div>
}

export function AccordionItem({ title, children }: { title: string, children: React.ReactNode }) {
  return <div className="govuk-accordion__section">
    <div className="govuk-accordion__section-header">
      <h2 className="govuk-accordion__section-heading">
        <span className="govuk-accordion__section-button" id="accordion-default-heading-2">
          {title}
        </span>
      </h2>
    </div>
    <div id="accordion-default-content-2" className="govuk-accordion__section-content">
      {children}
    </div>
  </div>
}