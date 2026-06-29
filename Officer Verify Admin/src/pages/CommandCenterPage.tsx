import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ActivityStream,
  DetailRow,
  Drawer,
  MethodBadge,
  PageHeader,
  Panel,
  ResultBadge,
  StatCard,
} from '../components/ui';
import { commandStats, officers, verifications } from '../data/mockData';
import type { VerificationAudit } from '../types';

function formatRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ago`;
}

export function CommandCenterPage() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<VerificationAudit | null>(null);
  const activeOfficers = officers.filter((o) => o.status === 'active').slice(0, 3);

  return (
    <>
      <PageHeader
        title="Command Center"
        description="Live overview of national licence verification activity."
        badge={
          <span className="flex items-center gap-1.5 rounded-full border border-verify-valid/40 bg-verify-valid/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-verify-valid">
            <span className="live-dot h-1.5 w-1.5 rounded-full bg-verify-valid" />
            Live
          </span>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Scans / hour"
          value={commandStats.scansPerHour}
          trend="+12% vs yesterday"
          accent="accent"
          icon={<span className="text-xl">↗</span>}
        />
        <StatCard
          label="Valid rate (24h)"
          value={commandStats.validRate}
          suffix="%"
          trend="Target ≥ 90%"
          accent="valid"
        />
        <StatCard
          label="Expired QR"
          value={commandStats.expiredQrCount}
          trend="Driver education signal"
          accent="warning"
        />
        <StatCard
          label="Open incidents"
          value={commandStats.openIncidents}
          trend="Requires triage"
          accent="invalid"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Panel
          className="xl:col-span-2"
          title="Activity stream"
          subtitle="Last 50 verifications · auto-refresh simulated"
          action={
            <button
              type="button"
              onClick={() => navigate('/verifications')}
              className="text-xs font-medium text-console-accent hover:underline"
            >
              View full log →
            </button>
          }
          noPadding
        >
          <div className="max-h-[420px] overflow-y-auto px-4">
            <ActivityStream items={verifications} onSelect={setSelected} />
          </div>
        </Panel>

        <Panel title="Officers on duty" subtitle={`${commandStats.activeOfficers} active sessions`}>
          <ul className="space-y-3">
            {activeOfficers.map((o) => (
              <li
                key={o.id}
                className="flex items-center justify-between rounded-lg border border-console-border bg-console-elevated/50 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-console-text">{o.name}</p>
                  <p className="font-mono text-xs text-console-muted">{o.officerId}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-verify-valid">Active</p>
                  <p className="text-[10px] text-console-muted">{formatRelative(o.lastActive)}</p>
                </div>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => navigate('/officers')}
            className="mt-4 w-full text-center text-xs font-medium text-console-accent hover:underline"
          >
            Manage officers →
          </button>
        </Panel>
      </div>

      <Drawer
        open={!!selected}
        onClose={() => setSelected(null)}
        title="Verification detail"
        subtitle={selected?.scanId}
      >
        {selected ? (
          <>
            <DetailRow label="Time" value={new Date(selected.verifiedAt).toLocaleString()} />
            <DetailRow label="Officer" value={`${selected.officerName} (${selected.officerId})`} mono />
            <DetailRow label="Method" value={<MethodBadge method={selected.method} />} />
            <DetailRow label="Result" value={<ResultBadge result={selected.result} />} />
            <DetailRow label="Licence" value={selected.licenceNumber} mono />
            <DetailRow label="Holder" value={selected.holderName} />
            <DetailRow label="Duration" value={`${selected.durationMs} ms`} mono />
            {selected.tokenId ? <DetailRow label="Token" value={selected.tokenId} mono /> : null}
          </>
        ) : null}
      </Drawer>
    </>
  );
}
