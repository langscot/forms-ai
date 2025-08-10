import type React from 'react';

export type RadioItem = {
  value: string;
  label: string;
  disabled?: boolean;
  checked?: boolean;
};

export default function Radios({
  name,
  legend,
  hint,
  items,
  legendSize = 'm',
  onChange,
  value,
}: {
  name: string;
  legend: string;
  hint?: string;
  items: RadioItem[];
  legendSize?: 's' | 'm' | 'l' | 'xl';
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  value?: string;
}) {
  const hintId = hint ? `${name}-hint` : undefined;

  return (
    <div className="govuk-form-group">
      <fieldset className="govuk-fieldset" aria-describedby={hintId}>
        <legend className={`govuk-fieldset__legend govuk-fieldset__legend--${legendSize}`}>
          <h1 className="govuk-fieldset__heading">{legend}</h1>
        </legend>

        {hint && (
          <div id={hintId} className="govuk-hint">
            {hint}
          </div>
        )}

        <div className="govuk-radios" data-module="govuk-radios">
          {items.map((item, index) => {
            const id = index === 0 ? name : `${name}-${index + 1}`;
            return (
              <div className="govuk-radios__item" key={id}>
                <input
                  className="govuk-radios__input"
                  id={id}
                  name={name}
                  type="radio"
                  value={item.value}
                  disabled={item.disabled}
                  onChange={onChange}
                  checked={value === item.value}
                />
                <label className="govuk-label govuk-radios__label" htmlFor={id}>
                  {item.label}
                </label>
              </div>
            );
          })}
        </div>
      </fieldset>
    </div>
  );
}


