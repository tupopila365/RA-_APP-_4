import type { ReactNode } from 'react';

interface PanelProps {
  children: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  noPadding?: boolean;
}

export function Panel({ children, className = '', title, subtitle, action, noPadding }: PanelProps) {
  return (
    <section
      className={`rounded-xl border border-console-border bg-console-surface shadow-panel ${className}`}
    >
      {(title || action) && (
        <header className="flex items-start justify-between gap-4 border-b border-console-border px-5 py-4">
          <div>
            {title ? <h2 className="text-sm font-semibold tracking-wide text-console-text">{title}</h2> : null}
            {subtitle ? <p className="mt-0.5 text-xs text-console-muted">{subtitle}</p> : null}
          </div>
          {action}
        </header>
      )}
      <div className={noPadding ? '' : 'p-5'}>{children}</div>
    </section>
  );
}
