export type DateParts = {
  day?: string;
  month?: string;
  year?: string;
};

export default function DateInput({
  name,
  legend,
  hint,
  legendSize = 'm',
  id,
  defaultValue,
  onChange,
  dayLabel = 'Day',
  monthLabel = 'Month',
  yearLabel = 'Year',
}: {
  name: string; // base for input names: `${name}-day|month|year`
  legend: string;
  hint?: string;
  legendSize?: 's' | 'm' | 'l' | 'xl';
  id?: string; // base id for the group; inputs use `${idBase}-day|month|year`
  defaultValue?: DateParts;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  dayLabel?: string;
  monthLabel?: string;
  yearLabel?: string;
}) {
  const idBase = id ?? name;
  const hintId = hint ? `${idBase}-hint` : undefined;

  return (
    <div className="govuk-form-group">
      <fieldset className="govuk-fieldset" role="group" aria-describedby={hintId}>
        <legend className={`govuk-fieldset__legend govuk-fieldset__legend--${legendSize}`}>
          <h1 className="govuk-fieldset__heading">{legend}</h1>
        </legend>

        {hint && (
          <div id={hintId} className="govuk-hint">
            {hint}
          </div>
        )}

        <div className="govuk-date-input" id={idBase}>
          <div className="govuk-date-input__item">
            <div className="govuk-form-group">
              <label className="govuk-label govuk-date-input__label" htmlFor={`${idBase}-day`}>
                {dayLabel}
              </label>
              <input
                className="govuk-input govuk-date-input__input govuk-input--width-2"
                id={`${idBase}-day`}
                name={`${name}-day`}
                type="text"
                inputMode="numeric"
                defaultValue={defaultValue?.day}
              />
            </div>
          </div>

          <div className="govuk-date-input__item">
            <div className="govuk-form-group">
              <label className="govuk-label govuk-date-input__label" htmlFor={`${idBase}-month`}>
                {monthLabel}
              </label>
              <input
                className="govuk-input govuk-date-input__input govuk-input--width-2"
                id={`${idBase}-month`}
                name={`${name}-month`}
                type="text"
                inputMode="numeric"
                defaultValue={defaultValue?.month}
              />
            </div>
          </div>

          <div className="govuk-date-input__item">
            <div className="govuk-form-group">
              <label className="govuk-label govuk-date-input__label" htmlFor={`${idBase}-year`}>
                {yearLabel}
              </label>
              <input
                className="govuk-input govuk-date-input__input govuk-input--width-4"
                id={`${idBase}-year`}
                name={`${name}-year`}
                type="text"
                inputMode="numeric"
                defaultValue={defaultValue?.year}
                onChange={onChange}
              />
            </div>
          </div>
        </div>
      </fieldset>
    </div>
  );
}


