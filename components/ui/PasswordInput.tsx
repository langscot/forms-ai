"use client";

import { useEffect } from 'react';
import type React from 'react';

export default function PasswordInput({
  name,
  label,
  id,
  hint,
  autoComplete = 'current-password',
  required = false,
  disabled = false,
  value,
  defaultValue,
  onChange,
  showToggle = true,
}: {
  name: string;
  label: string;
  id?: string;
  hint?: string;
  autoComplete?: string;
  required?: boolean;
  disabled?: boolean;
  value?: string;
  defaultValue?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  showToggle?: boolean;
}) {
  const inputId = id ?? name;
  const hintId = hint ? `${inputId}-hint` : undefined;

  useEffect(() => {
    // Progressive enhancement for password reveal and button styling
    import('govuk-frontend').then((mod: any) => {
      try {
        if (mod?.createAll && mod?.PasswordInput) {
          mod.createAll(mod.PasswordInput);
        } else if (mod?.initAll) {
          mod.initAll();
        }
        if (mod?.createAll && mod?.Button) {
          mod.createAll(mod.Button);
        }
      } catch {
        // no-op if JS init is unavailable
      }
    });
  }, []);

  return (
    <div className="govuk-form-group govuk-password-input" data-module="govuk-password-input">
      <label className="govuk-label" htmlFor={inputId}>
        {label}
      </label>
      {hint && (
        <div id={hintId} className="govuk-hint">
          {hint}
        </div>
      )}
      <div className="govuk-input__wrapper govuk-password-input__wrapper">
        <input
          className="govuk-input govuk-password-input__input govuk-js-password-input-input"
          id={inputId}
          name={name}
          type="password"
          spellCheck={false}
          autoComplete={autoComplete}
          autoCapitalize="none"
          aria-describedby={hintId}
          required={required}
          disabled={disabled}
          value={value}
          defaultValue={defaultValue}
          onChange={onChange}
        />
        {showToggle && (
          <button
            type="button"
            className="govuk-button govuk-button--secondary govuk-password-input__toggle govuk-js-password-input-toggle"
            data-module="govuk-button"
            aria-controls={inputId}
            aria-label="Show password"
            hidden
          >
            Show
          </button>
        )}
      </div>
    </div>
  );
}


