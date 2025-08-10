export default function Header({ title }: { title: string }) {
  return <header className="govuk-header" data-module="govuk-header">
    <div className="govuk-header__container govuk-width-container">
      <div className="govuk-header__logo">
        <a href="#" className="govuk-header__link govuk-header__link--homepage font-black">
          {title.toUpperCase()}
        </a>
      </div>
    </div>
  </header>
}