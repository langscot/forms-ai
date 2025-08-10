export default function Breadcrumb({ children }: { children: React.ReactNode }) {
  return <nav className="govuk-breadcrumbs" aria-label="Breadcrumb">
    <ol className="govuk-breadcrumbs__list">
      {children}
    </ol>
  </nav>
}

export function BreadcrumbItem({ href, children }: { href?: string, children: React.ReactNode }) {
  return <li className="govuk-breadcrumbs__list-item">
    {href ? <a className="govuk-breadcrumbs__link" href={href}>{children}</a> : children}
  </li>
}