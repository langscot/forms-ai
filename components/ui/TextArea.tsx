import type React from 'react';

export default function TextArea({
  name,
  hint,
  label,
  id,
  className,
  rows = 5,
  labelSize = 's',
  required = false,
  disabled = false,
  defaultValue,
  maxLength,
  placeholder,
  ariaDescribedBy,
  onChange,
  value,
}: {
  name?: string;
  label?: string;
  hint?: string;
  id?: string;
  className?: string;
  rows?: number;
  labelSize?: 's' | 'm' | 'l' | 'xl';
  required?: boolean;
  disabled?: boolean;
  defaultValue?: string;
  maxLength?: number;
  placeholder?: string;
  ariaDescribedBy?: string;
  onChange?: React.ChangeEventHandler<HTMLTextAreaElement>;
  value?: string;
}) {
  const inputId = id ?? name;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const describedBy = [hintId, ariaDescribedBy].filter(Boolean).join(' ') || undefined;

  return (
    <div className="govuk-form-group">
      {label && <h1 className="govuk-label-wrapper">
        <label className={`govuk-label govuk-label--${labelSize}`} htmlFor={inputId}>
          {label}
        </label>
      </h1>}

      {hint && (
        <div id={hintId} className="govuk-hint">
          {hint}
        </div>
      )}

      <textarea
        className={`govuk-textarea bg-white ${className}`}
        id={inputId}
        name={name}
        rows={rows}
        aria-describedby={describedBy}
        required={required}
        disabled={disabled}
        defaultValue={defaultValue}
        maxLength={maxLength}
        onChange={onChange}
        value={value}
        placeholder={placeholder}
      />
    </div>
  );
}


