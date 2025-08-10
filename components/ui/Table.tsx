export default function Table({ title, headers, rows }: { title: string, headers: string[], rows: string[][] }) {
  return <table className="govuk-table">
    <caption className="govuk-table__caption govuk-table__caption--m">{title}</caption>
    <thead className="govuk-table__head">
      <tr className="govuk-table__row">
        {headers.map((header) => (
          <th scope="col" className="govuk-table__header" key={header}>
            {header}
          </th>
        ))}
      </tr>
    </thead>
    <tbody className="govuk-table__body">
      {rows.map((row) => (
        <tr className="govuk-table__row" key={row.join(",")}>
          {row.map((cell) => (
            <td className="govuk-table__cell" key={cell}>{cell}</td>
          ))}
        </tr>
      ))}
    </tbody>
  </table>
}
