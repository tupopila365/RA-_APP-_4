import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  children: ReactNode;
  loading?: boolean;
}

const variants: Record<Variant, string> = {
  primary:
    'bg-console-accent text-console-bg hover:bg-cyan-400 shadow-glow border border-cyan-400/30',
  secondary:
    'bg-console-elevated text-console-text border border-console-border hover:border-console-accent/50',
  ghost: 'text-console-muted hover:text-console-text hover:bg-console-elevated',
  danger: 'bg-verify-invalid/15 text-verify-invalid border border-verify-invalid/40 hover:bg-verify-invalid/25',
};

export function Button({
  variant = 'primary',
  children,
  className = '',
  loading,
  disabled,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : null}
      {children}
    </button>
  );
}
