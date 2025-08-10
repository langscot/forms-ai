export default function Tag({ children, variant = 'grey' }: { children: React.ReactNode, variant?: 'grey' | 'green' | 'turquoise' | 'blue' | 'light-blue' | 'purple' | 'pink' | 'red' | 'orange' | 'yellow' }) {
  return <strong className={`govuk-tag govuk-tag--${variant} inline-block max-w-none! w-fit`}>
    {children}
  </strong>
}