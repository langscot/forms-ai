export type CheckboxesItem = {
  id?: string;
  value: string;
  label: string;
  disabled?: boolean;
  checked?: boolean;
};

export default function Checkboxes({
  name,
  legend,
  hint,
  items,
  legendSize = 'm',
  value,
  onChange,
}: {
  name: string;
  legend: string;
  hint?: string;
  items: CheckboxesItem[];
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

        <div className="govuk-checkboxes" data-module="govuk-checkboxes">
          {items.map((item, index) => {
            const autoId = index === 0 ? name : `${name}-${index + 1}`;
            const id = item.id ?? autoId;
            return (
              <div className="govuk-checkboxes__item" key={id}>
                <input
                  className="govuk-checkboxes__input"
                  id={id}
                  name={name}
                  type="checkbox"
                  value={item.value}
                  disabled={item.disabled}
                  onChange={onChange}
                  checked={value === item.value}
                />
                <label className="govuk-label govuk-checkboxes__label" htmlFor={id}>
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


