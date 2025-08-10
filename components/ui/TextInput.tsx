import type React from 'react';

export default function TextInput({
  name,
  label,
  hint,
  id,
  labelSize = 'm',
  type = 'text',
  required = false,
  disabled = false,
  defaultValue,
  maxLength,
  pattern,
  autoComplete,
  inputMode,
  className,
  onChange,
  value,
}: {
  name: string;
  label: string;
  hint?: string;
  id?: string;
  labelSize?: 's' | 'm' | 'l' | 'xl';
  type?: 'text' | 'email' | 'tel' | 'url' | 'search' | 'password';
  required?: boolean;
  disabled?: boolean;
  defaultValue?: string;
  maxLength?: number;
  pattern?: string;
  autoComplete?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  className?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  value?: string;
}) {
  const inputId = id ?? name;
  const hintId = hint ? `${inputId}-hint` : undefined;

  return (
    <div className="govuk-form-group">
      <h1 className="govuk-label-wrapper">
        <label className={`govuk-label govuk-label--${labelSize}`} htmlFor={inputId}>
          {label}
        </label>
      </h1>

      {hint && (
        <div id={hintId} className="govuk-hint">
          {hint}
        </div>
      )}

      <input
        className={`govuk-input${className ? ` ${className}` : ''}`}
        id={inputId}
        name={name}
        type={type}
        aria-describedby={hintId}
        required={required}
        disabled={disabled}
        defaultValue={defaultValue}
        maxLength={maxLength}
        pattern={pattern}
        autoComplete={autoComplete}
        inputMode={inputMode}
        onChange={onChange}
        value={value}
      />
    </div>
  );
}


