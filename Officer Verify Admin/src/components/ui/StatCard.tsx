import type { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  suffix?: string;
  trend?: string;
  icon?: ReactNode;
  accent?: 'default' | 'valid' | 'warning' | 'invalid' | 'accent';
}

const accentBorder = {
  default: 'border-console-border',
  valid: 'border-verify-valid/30',
  warning: 'border-verify-warning/30',
  invalid: 'border-verify-invalid/30',
  accent: 'border-console-accent/40',
};

const accentValue = {
  default: 'text-console-text',
  valid: 'text-verify-valid',
  warning: 'text-verify-warning',
  invalid: 'text-verify-invalid',
  accent: 'text-console-accent',
};

export function StatCard({ label, value, suffix, trend, icon, accent = 'default' }: StatCardProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl border bg-console-surface p-5 shadow-panel ${accentBorder[accent]}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-console-muted">{label}</p>
          <p className={`mt-2 font-mono text-3xl font-semibold tabular-nums ${accentValue[accent]}`}>
            {value}
            {suffix ? <span className="ml-1 text-lg text-console-muted">{suffix}</span> : null}
          </p>
          {trend ? <p className="mt-1 text-xs text-console-muted">{trend}</p> : null}
        </div>
        {icon ? <div className="text-console-muted">{icon}</div> : null}
      </div>
    </div>
  );
}
