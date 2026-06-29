import type { VerificationMethod, VerificationResult } from '../../types';

const resultStyles: Record<string, string> = {
  valid: 'bg-verify-valid/15 text-verify-valid border-verify-valid/30',
  expired: 'bg-verify-warning/15 text-verify-warning border-verify-warning/30',
  suspended: 'bg-verify-invalid/15 text-verify-invalid border-verify-invalid/30',
  revoked: 'bg-verify-invalid/15 text-verify-invalid border-verify-invalid/30',
  not_found: 'bg-verify-invalid/15 text-verify-invalid border-verify-invalid/30',
  token_expired: 'bg-console-muted/20 text-console-muted border-console-border',
  token_used: 'bg-verify-warning/15 text-verify-warning border-verify-warning/30',
  invalid: 'bg-verify-invalid/15 text-verify-invalid border-verify-invalid/30',
};

const resultLabels: Record<string, string> = {
  valid: 'VALID',
  expired: 'EXPIRED',
  suspended: 'SUSPENDED',
  revoked: 'REVOKED',
  not_found: 'NOT FOUND',
  token_expired: 'QR EXPIRED',
  token_used: 'QR USED',
  invalid: 'INVALID',
};

export function ResultBadge({ result }: { result: VerificationResult | string }) {
  const key = String(result).toLowerCase();
  return (
    <span
      className={`inline-flex items-center rounded border px-2 py-0.5 font-mono text-[10px] font-semibold tracking-wider ${resultStyles[key] || resultStyles.invalid}`}
    >
      {resultLabels[key] || key.toUpperCase()}
    </span>
  );
}

export function MethodBadge({ method }: { method: VerificationMethod }) {
  const isManual = method === 'manual_lookup';
  return (
    <span
      className={`inline-flex items-center rounded border px-2 py-0.5 font-mono text-[10px] font-semibold tracking-wider ${
        isManual
          ? 'border-verify-manual/40 bg-verify-manual/15 text-verify-manual'
          : 'border-console-accent/40 bg-console-accent/10 text-console-accent'
      }`}
    >
      {isManual ? 'MANUAL' : 'QR'}
    </span>
  );
}

export function StatusDot({ status }: { status: 'active' | 'suspended' | 'inactive' | string }) {
  const colors: Record<string, string> = {
    active: 'bg-verify-valid',
    suspended: 'bg-verify-invalid',
    inactive: 'bg-console-muted',
    open: 'bg-verify-invalid',
    investigating: 'bg-verify-warning',
    closed: 'bg-console-muted',
  };
  return (
    <span className={`inline-block h-2 w-2 rounded-full ${colors[status] || 'bg-console-muted'}`} />
  );
}

export function SeverityBadge({ severity }: { severity: 'low' | 'medium' | 'high' }) {
  const map = {
    low: 'text-console-muted border-console-border bg-console-elevated',
    medium: 'text-verify-warning border-verify-warning/40 bg-verify-warning/10',
    high: 'text-verify-invalid border-verify-invalid/40 bg-verify-invalid/10',
  };
  return (
    <span className={`rounded border px-2 py-0.5 text-[10px] font-semibold uppercase ${map[severity]}`}>
      {severity}
    </span>
  );
}
