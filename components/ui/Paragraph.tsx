export default function Paragraph({ children }: { children: React.ReactNode }) {
  return <p className="govuk-body">
    {children}
  </p>
}