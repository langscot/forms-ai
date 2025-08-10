import type React from 'react';

export default function NumberInput({
  name,
  label,
  hint,
  id,
  labelSize = 'm',
  required = false,
  disabled = false,
  defaultValue,
  min,
  max,
  step,
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
  required?: boolean;
  disabled?: boolean;
  defaultValue?: number | string;
  min?: number;
  max?: number;
  step?: number;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  className?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  value?: number;
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
        type="number"
        min={min}
        max={max}
        step={step}
        inputMode={inputMode}
        aria-describedby={hintId}
        required={required}
        disabled={disabled}
        defaultValue={defaultValue as unknown as string}
        onChange={onChange}
        value={value as unknown as string}
      />
    </div>
  );
}


