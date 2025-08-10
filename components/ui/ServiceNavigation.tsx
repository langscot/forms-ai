"use client";

import { useEffect } from 'react';

export default function ServiceNavigation({ children, className }: { children: React.ReactNode, className?: string }) {
  useEffect(() => {
    import('govuk-frontend')
      .then(({ createAll, ServiceNavigation }) => {
        createAll(ServiceNavigation);
      });
  }, []);

  return <div className={`govuk-service-navigation ${className}`}
    data-module="govuk-service-navigation">
    <div className="govuk-width-container">
      <div className="govuk-service-navigation__container">
        <nav aria-label="Menu" className="govuk-service-navigation__wrapper">
          <button type="button" className="govuk-service-navigation__toggle govuk-js-service-navigation-toggle" aria-controls="navigation" hidden>
            Menu
          </button>
          <ul className="govuk-service-navigation__list" id="navigation">
            {children}
          </ul>
        </nav>
      </div>
    </div>
  </div>
}

export function ServiceNavigationItem({ children, active, onClick }: { children: React.ReactNode, active?: boolean, onClick?: () => void }) {
  return <li className={`govuk-service-navigation__item ${active ? 'govuk-service-navigation__item--active' : ''}`}>
    <button className="govuk-service-navigation__link" {...(active && { 'aria-current': 'true' })} onClick={onClick}>
      {active ? <strong className="govuk-service-navigation__active-fallback">{children}</strong> : children}
    </button>
  </li>
}