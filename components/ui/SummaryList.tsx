export default function SummaryList({ children }: { children: React.ReactNode }) {
  return <dl className="govuk-summary-list">
    {children}
  </dl>
}

export function SummaryListItem({ label, value, actions }: { label: string, value: string, actions?: React.ReactNode }) {
  return <div className="govuk-summary-list__row">
    <dt className="govuk-summary-list__key">
      {label}
    </dt>
    <dd className="govuk-summary-list__value">
      {value}
    </dd>
    <dd className="govuk-summary-list__actions">
      {actions}
    </dd>
  </div>
}