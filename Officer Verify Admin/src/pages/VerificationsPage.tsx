import { useMemo, useState } from 'react';
import {
  Button,
  DataTable,
  DetailRow,
  Drawer,
  MethodBadge,
  PageHeader,
  Panel,
  ResultBadge,
  SearchField,
  SelectField,
} from '../components/ui';
import { verifications } from '../data/mockData';
import type { VerificationAudit } from '../types';

export function VerificationsPage() {
  const [search, setSearch] = useState('');
  const [resultFilter, setResultFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [selected, setSelected] = useState<VerificationAudit | null>(null);

  const filtered = useMemo(() => {
    return verifications.filter((v) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        v.scanId.toLowerCase().includes(q) ||
        v.officerId.toLowerCase().includes(q) ||
        v.licenceNumber.toLowerCase().includes(q) ||
        v.holderName.toLowerCase().includes(q);
      const matchResult = resultFilter === 'all' || v.result === resultFilter;
      const matchMethod = methodFilter === 'all' || v.method === methodFilter;
      return matchSearch && matchResult && matchMethod;
    });
  }, [search, resultFilter, methodFilter]);

  const columns = [
    {
      key: 'time',
      header: 'Time',
      render: (v: VerificationAudit) => (
        <span className="font-mono text-xs tabular-nums">
          {new Date(v.verifiedAt).toLocaleString('en-GB', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          })}
        </span>
      ),
    },
    {
      key: 'officer',
      header: 'Officer',
      render: (v: VerificationAudit) => (
        <span className="font-mono text-xs text-console-accent">{v.officerId}</span>
      ),
    },
    {
      key: 'method',
      header: 'Method',
      render: (v: VerificationAudit) => <MethodBadge method={v.method} />,
    },
    {
      key: 'result',
      header: 'Result',
      render: (v: VerificationAudit) => <ResultBadge result={v.result} />,
    },
    {
      key: 'licence',
      header: 'Licence',
      render: (v: VerificationAudit) => (
        <span className="font-mono text-xs">{v.licenceNumber}</span>
      ),
    },
    {
      key: 'holder',
      header: 'Holder',
      render: (v: VerificationAudit) => <span className="text-sm">{v.holderName}</span>,
    },
    {
      key: 'ms',
      header: 'Duration',
      render: (v: VerificationAudit) => (
        <span className="font-mono text-xs text-console-muted">{v.durationMs}ms</span>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Verification Log"
        description="Immutable audit trail of every roadside licence check."
        actions={<Button variant="secondary">Export CSV</Button>}
      />

      <Panel noPadding>
        <div className="flex flex-col gap-3 border-b border-console-border p-4 lg:flex-row lg:items-center">
          <SearchField
            value={search}
            onChange={setSearch}
            placeholder="Scan ID, officer, licence, holder…"
            className="flex-1"
          />
          <SelectField
            value={resultFilter}
            onChange={setResultFilter}
            options={[
              { value: 'all', label: 'All results' },
              { value: 'valid', label: 'Valid' },
              { value: 'token_expired', label: 'QR expired' },
              { value: 'not_found', label: 'Not found' },
              { value: 'suspended', label: 'Suspended' },
            ]}
          />
          <SelectField
            value={methodFilter}
            onChange={setMethodFilter}
            options={[
              { value: 'all', label: 'All methods' },
              { value: 'qr_scan', label: 'QR only' },
              { value: 'manual_lookup', label: 'Manual only' },
            ]}
          />
        </div>
        <div className="p-4">
          <DataTable
            columns={columns}
            data={filtered}
            keyField="id"
            onRowClick={setSelected}
          />
        </div>
      </Panel>

      <Drawer
        open={!!selected}
        onClose={() => setSelected(null)}
        title="Scan record"
        subtitle={selected?.scanId}
        footer={
          selected ? (
            <Button variant="secondary" className="w-full">
              Flag as incident
            </Button>
          ) : null
        }
      >
        {selected ? (
          <>
            <DetailRow label="Verified at" value={new Date(selected.verifiedAt).toLocaleString()} />
            <DetailRow
              label="Officer"
              value={`${selected.officerName} · ${selected.officerId}`}
              mono
            />
            <DetailRow label="Organisation" value={selected.organisation} />
            <DetailRow label="Method" value={<MethodBadge method={selected.method} />} />
            <DetailRow label="Result" value={<ResultBadge result={selected.result} />} />
            <DetailRow label="Licence number" value={selected.licenceNumber} mono />
            <DetailRow label="Holder" value={selected.holderName} />
            <DetailRow label="API duration" value={`${selected.durationMs} ms`} mono />
            {selected.tokenId ? (
              <>
                <p className="mb-2 mt-4 text-xs font-semibold uppercase tracking-wider text-console-muted">
                  Token
                </p>
                <DetailRow label="ID" value={selected.tokenId} mono />
              </>
            ) : null}
            {selected.registrySnapshot ? (
              <>
                <p className="mb-2 mt-4 text-xs font-semibold uppercase tracking-wider text-console-muted">
                  Registry snapshot (at scan time)
                </p>
                <DetailRow label="Status" value={selected.registrySnapshot.status.toUpperCase()} />
                <DetailRow label="Codes" value={selected.registrySnapshot.codes.join(', ')} />
                <DetailRow label="Expiry" value={selected.registrySnapshot.expiryDate} />
              </>
            ) : null}
          </>
        ) : null}
      </Drawer>
    </>
  );
}
