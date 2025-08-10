export default function WarningText({ children }: { children: React.ReactNode }) {
  return <div className="govuk-warning-text">
    <span className="govuk-warning-text__icon" aria-hidden="true">!</span>
    <strong className="govuk-warning-text__text">
      <span className="govuk-visually-hidden">Warning</span>
      {children}
    </strong>
  </div>
}