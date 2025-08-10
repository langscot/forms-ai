type ButtonProps = {
  onClick?: () => void;
  children: React.ReactNode;
  type?: 'button' | 'submit';
  disabled?: boolean;
  variant?: 'default' | 'secondary' | 'destructive';
};

export default function Button({
  onClick,
  variant = 'default',
  children,
  type = 'button',
  disabled = false,
}: ButtonProps) {
  const variantClass =
    variant === 'secondary'
      ? 'govuk-button--secondary'
      : variant === 'destructive'
        ? 'govuk-button--destructive'
        : '';

  return (
    <button
      type={type}
      className={`govuk-button m-0! ${variantClass}`}
      data-module="govuk-button"
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}