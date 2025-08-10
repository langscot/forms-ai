export default function PhaseBanner({ title, children }: { title: string, children: React.ReactNode }) {
  return <div className="govuk-phase-banner">
    <p className="govuk-phase-banner__content">
      <strong className="govuk-tag govuk-phase-banner__content__tag">
        {title}
      </strong>
      <span className="govuk-phase-banner__text">
        {children}
      </span>
    </p>
  </div>
}