export default function ExitPage() {
  return <div className="govuk-exit-this-page" data-module="govuk-exit-this-page">
    <a href="https://www.bbc.co.uk/weather" role="button" draggable="false" className="govuk-button govuk-button--warning govuk-exit-this-page__button govuk-js-exit-this-page-button" data-module="govuk-button" rel="nofollow noreferrer">
      <span className="govuk-visually-hidden">Emergency</span> Exit this page
    </a>
  </div>
}