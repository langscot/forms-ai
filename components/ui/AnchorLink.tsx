import Link from 'next/link';

export default function AnchorLink({ href, children, className }: { href?: string; children: React.ReactNode, className?: string }) {
  const safeHref = href ?? '#';
  const lower = safeHref.toLowerCase();
  const isHash = safeHref.startsWith('#');
  const isRelative = safeHref.startsWith('/') || isHash;
  const isMailOrTel = lower.startsWith('mailto:') || lower.startsWith('tel:');
  const isHttp = lower.startsWith('http://') || lower.startsWith('https://');

  if (isRelative) {
    return (
      <Link href={safeHref} className={`govuk-link ${className}`}>
        {children}
      </Link>
    );
  }

  if (isMailOrTel) {
    return (
      <a href={safeHref} className={`govuk-link ${className}`}>
        {children}
      </a>
    );
  }

  if (isHttp) {
    return (
      <a href={safeHref} className={`govuk-link ${className}`} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }

  // Fallback
  return (
    <a href={safeHref} className={`govuk-link ${className}`}>
      {children}
    </a>
  );
}