import { useState } from 'react';
import { Button, PageHeader, Panel, SeverityBadge, StatusDot } from '../components/ui';
import { incidents } from '../data/mockData';
import type { Incident, IncidentStatus } from '../types';

const columns: { key: IncidentStatus; label: string }[] = [
  { key: 'open', label: 'Open' },
  { key: 'investigating', label: 'Investigating' },
  { key: 'closed', label: 'Closed' },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function IncidentCard({ inc }: { inc: Incident }) {
  return (
    <li className="rounded-lg border border-console-border bg-console-elevated/40 p-4 transition hover:border-console-accent/30">
      <div className="mb-2 flex items-start justify-between gap-2">
        <SeverityBadge severity={inc.severity} />
        <span className="flex items-center gap-1.5 text-[10px] capitalize text-console-muted">
          <StatusDot status={inc.status} />
          {inc.status}
        </span>
      </div>
      <h3 className="text-sm font-semibold text-console-text">{inc.title}</h3>
      <p className="mt-1 line-clamp-2 text-xs text-console-muted">{inc.description}</p>
      <div className="mt-3 flex items-center justify-between border-t border-console-border/50 pt-3">
        <span className="font-mono text-[10px] text-console-accent">{inc.officerId}</span>
        <span className="text-[10px] text-console-muted">{formatDate(inc.createdAt)}</span>
      </div>
      {inc.assignee ? (
        <p className="mt-2 text-[10px] text-console-muted">Assignee: {inc.assignee}</p>
      ) : null}
    </li>
  );
}

export function IncidentsPage() {
  const [filter, setFilter] = useState<IncidentStatus | 'all'>('all');

  const filtered =
    filter === 'all' ? incidents : incidents.filter((i) => i.status === filter);

  return (
    <>
      <PageHeader
        title="Incidents"
        description="Trust and fraud queue — abnormal verification patterns requiring triage."
        actions={<Button variant="secondary">Export report</Button>}
      />

      <div className="mb-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
            filter === 'all'
              ? 'bg-console-accent/15 text-console-accent ring-1 ring-console-accent/30'
              : 'text-console-muted hover:bg-console-elevated'
          }`}
        >
          All ({incidents.length})
        </button>
        {columns.map((col) => {
          const count = incidents.filter((i) => i.status === col.key).length;
          return (
            <button
              key={col.key}
              type="button"
              onClick={() => setFilter(col.key)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize ${
                filter === col.key
                  ? 'bg-console-accent/15 text-console-accent ring-1 ring-console-accent/30'
                  : 'text-console-muted hover:bg-console-elevated'
              }`}
            >
              {col.label} ({count})
            </button>
          );
        })}
      </div>

      {filter === 'all' ? (
        <div className="grid gap-6 lg:grid-cols-3">
          {columns.map((col) => (
            <Panel
              key={col.key}
              title={col.label}
              subtitle={`${incidents.filter((i) => i.status === col.key).length} items`}
            >
              <ul className="space-y-3">
                {incidents
                  .filter((i) => i.status === col.key)
                  .map((inc) => (
                    <IncidentCard key={inc.id} inc={inc} />
                  ))}
                {!incidents.some((i) => i.status === col.key) ? (
                  <li className="py-6 text-center text-xs text-console-muted">No incidents</li>
                ) : null}
              </ul>
            </Panel>
          ))}
        </div>
      ) : (
        <Panel title={columns.find((c) => c.key === filter)?.label || 'Incidents'}>
          <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((inc) => (
              <IncidentCard key={inc.id} inc={inc} />
            ))}
          </ul>
        </Panel>
      )}
    </>
  );
}
