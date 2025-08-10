export default function Heading({ level = 1, children }: { level?: 1 | 2 | 3 | 4 | 5; children: React.ReactNode }) {
  const getClassName = (level: number) => {
    switch (level) {
      case 1: return "govuk-heading-xl";
      case 2: return "govuk-heading-l";
      case 3: return "govuk-heading-m";
      case 4: return "govuk-heading-s";
      case 5: return "govuk-heading-s";
      default: return "govuk-heading-l";
    }
  };

  const className = getClassName(level);

  switch (level) {
    case 1: return <h1 className={className}>{children}</h1>;
    case 2: return <h2 className={className}>{children}</h2>;
    case 3: return <h3 className={className}>{children}</h3>;
    case 4: return <h4 className={className}>{children}</h4>;
    case 5: return <h5 className={className}>{children}</h5>;
    default: return <h2 className={className}>{children}</h2>;
  }
} 