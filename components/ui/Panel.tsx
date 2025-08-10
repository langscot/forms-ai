export default function Panel({ title, children }: { title: string, children: React.ReactNode }) {
  return <div className="govuk-panel govuk-panel--confirmation">
    <h1 className="govuk-panel__title">
      {title}
    </h1>
    <div className="govuk-panel__body">
      {children}
    </div>
  </div>
}