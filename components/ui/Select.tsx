import type React from 'react';

export type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
  selected?: boolean;
};

export default function Select({
  name,
  label,
  id,
  hint,
  options,
  placeholder,
  required = false,
  disabled = false,
  onChange,
  value,
}: {
  name: string;
  label: string;
  id?: string;
  hint?: string;
  options: SelectOption[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  defaultValue?: string;
  onChange?: React.ChangeEventHandler<HTMLSelectElement>;
  value?: string;
}) {
  const selectId = id ?? name;
  const hintId = hint ? `${selectId}-hint` : undefined;

  return (
    <div className="govuk-form-group">
      <label className="govuk-label" htmlFor={selectId}>
        {label}
      </label>
      {hint && (
        <div id={hintId} className="govuk-hint">
          {hint}
        </div>
      )}
      <select
        className="govuk-select"
        id={selectId}
        name={name}
        aria-describedby={hintId}
        required={required}
        disabled={disabled}
        onChange={onChange}
        value={value}
      >
        {placeholder && (
          <option value="" disabled={required} hidden={required}>
            {placeholder}
          </option>
        )}
        {options.map((opt, idx) => (
          <option key={`${opt.value}-${idx}`} value={opt.value} disabled={opt.disabled}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}


