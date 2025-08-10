import type React from 'react';

export default function FileUpload({
  name,
  label,
  id,
  hint,
  multiple = false,
  accept,
  required = false,
  disabled = false,
  onChange,
}: {
  name: string;
  label: string;
  id?: string;
  hint?: string;
  multiple?: boolean;
  accept?: string;
  required?: boolean;
  disabled?: boolean;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
}) {
  const inputId = id ?? name;
  const hintId = hint ? `${inputId}-hint` : undefined;

  return (
    <div className="govuk-form-group">
      <label className="govuk-label" htmlFor={inputId}>
        {label}
      </label>
      {hint && (
        <div id={hintId} className="govuk-hint">
          {hint}
        </div>
      )}
      <input
        className="govuk-file-upload"
        id={inputId}
        name={name}
        type="file"
        aria-describedby={hintId}
        multiple={multiple}
        accept={accept}
        required={required}
        disabled={disabled}
        onChange={onChange}
      />
    </div>
  );
}


