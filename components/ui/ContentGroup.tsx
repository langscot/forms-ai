import type React from 'react';

export default function ContentGroup({
  legend,
  children,
  hint,
  description,
  legendSize = 'm',
  id,
  className,
}: {
  legend: string;
  children: React.ReactNode;
  hint?: string;
  description?: React.ReactNode;
  legendSize?: 's' | 'm' | 'l' | 'xl';
  id?: string;
  className?: string;
}) {
  const fieldsetId = id;
  const hintId = hint ? `${fieldsetId ?? 'fieldset'}-hint` : undefined;
  const descId = description ? `${fieldsetId ?? 'fieldset'}-desc` : undefined;
  const describedBy = [hintId, descId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={`govuk-form-group${className ? ` ${className}` : ''}`}>
      <fieldset className="govuk-fieldset" aria-describedby={describedBy} id={fieldsetId}>
        <legend className={`govuk-fieldset__legend govuk-fieldset__legend--${legendSize}`}>
          <h1 className="govuk-fieldset__heading">{legend}</h1>
        </legend>

        {hint && (
          <div id={hintId} className="govuk-hint">
            {hint}
          </div>
        )}

        {description && (
          <div id={descId} className="govuk-body">
            {description}
          </div>
        )}

        {children}
      </fieldset>
    </div>
  );
}


