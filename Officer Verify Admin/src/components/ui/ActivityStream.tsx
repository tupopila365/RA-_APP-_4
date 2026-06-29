import type { VerificationAudit } from '../../types';
import { MethodBadge, ResultBadge } from './StatusBadge';

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

interface ActivityStreamProps {
  items: VerificationAudit[];
  onSelect?: (item: VerificationAudit) => void;
  compact?: boolean;
}

export function ActivityStream({ items, onSelect, compact }: ActivityStreamProps) {
  return (
    <ul className="divide-y divide-console-border/60">
      {items.map((item) => (
        <li key={item.id}>
          <button
            type="button"
            onClick={() => onSelect?.(item)}
            className="flex w-full items-center gap-3 px-1 py-3 text-left transition hover:bg-console-elevated/40"
          >
            <span className="live-dot h-1.5 w-1.5 shrink-0 rounded-full bg-console-accent" />
            <span className="font-mono text-xs tabular-nums text-console-muted">
              {formatTime(item.verifiedAt)}
            </span>
            <span className="min-w-0 flex-1 truncate text-sm text-console-text">
              <span className="font-mono text-console-accent">{item.officerId}</span>
              {!compact && (
                <span className="text-console-muted"> · {item.officerName}</span>
              )}
            </span>
            <ResultBadge result={item.result} />
            <MethodBadge method={item.method} />
            {!compact && item.licenceNumber !== '—' && (
              <span className="hidden font-mono text-xs text-console-muted sm:inline">
                {item.licenceNumber}
              </span>
            )}
          </button>
        </li>
      ))}
    </ul>
  );
}
