import Link from 'next/link';

export default function AnchorLink({ href, children }: { href?: string; children: React.ReactNode }) {
  const safeHref = href ?? '#';
  const lower = safeHref.toLowerCase();
  const isHash = safeHref.startsWith('#');
  const isRelative = safeHref.startsWith('/') || isHash;
  const isMailOrTel = lower.startsWith('mailto:') || lower.startsWith('tel:');
  const isHttp = lower.startsWith('http://') || lower.startsWith('https://');

  if (isRelative) {
    return (
      <Link href={safeHref} className="govuk-link">
        {children}
      </Link>
    );
  }

  if (isMailOrTel) {
    return (
      <a href={safeHref} className="govuk-link">
        {children}
      </a>
    );
  }

  if (isHttp) {
    return (
      <a href={safeHref} className="govuk-link" target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }

  // Fallback
  return (
    <a href={safeHref} className="govuk-link">
      {children}
    </a>
  );
}