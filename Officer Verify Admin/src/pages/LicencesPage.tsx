import { useMemo, useState } from 'react';
import {
  DataTable,
  DetailRow,
  Drawer,
  PageHeader,
  Panel,
  ResultBadge,
  SearchField,
} from '../components/ui';
import { licences, verifications } from '../data/mockData';
import type { LicenceRecord } from '../types';

const statusResult = {
  active: 'valid',
  expired: 'expired',
  suspended: 'suspended',
  revoked: 'revoked',
} as const;

export function LicencesPage() {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<LicenceRecord | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return licences;
    return licences.filter(
      (l) =>
        l.displayNumber.toLowerCase().includes(q) ||
        l.fullName.toLowerCase().includes(q) ||
        l.licenceNumber.toLowerCase().includes(q)
    );
  }, [search]);

  const historyFor = (licence: LicenceRecord) =>
    verifications.filter((v) => v.licenceNumber.replace(/\s/g, '') === licence.licenceNumber);

  const columns = [
    {
      key: 'number',
      header: 'Licence number',
      render: (l: LicenceRecord) => (
        <span className="font-mono text-sm text-console-accent">{l.displayNumber}</span>
      ),
    },
    {
      key: 'name',
      header: 'Holder',
      render: (l: LicenceRecord) => <span className="font-medium">{l.fullName}</span>,
    },
    {
      key: 'codes',
      header: 'Codes',
      render: (l: LicenceRecord) => (
        <span className="font-mono text-sm">{l.codes.join(', ')}</span>
      ),
    },
    {
      key: 'expiry',
      header: 'Expiry',
      render: (l: LicenceRecord) => <span className="text-sm text-console-muted">{l.expiryDate}</span>,
    },
    {
      key: 'status',
      header: 'Registry status',
      render: (l: LicenceRecord) => <ResultBadge result={statusResult[l.status]} />,
    },
  ];

  return (
    <>
      <PageHeader
        title="Licences"
        description="Read-only NaTIS registry mirror for help desk and investigations."
        badge={
          <span className="rounded border border-console-border px-2 py-0.5 text-[10px] uppercase tracking-wider text-console-muted">
            Read only
          </span>
        }
      />

      <Panel noPadding>
        <div className="border-b border-console-border p-4">
          <SearchField
            value={search}
            onChange={setSearch}
            placeholder="Licence number or holder name…"
          />
        </div>
        <div className="p-4">
          <DataTable
            columns={columns}
            data={filtered}
            keyField="licenceNumber"
            onRowClick={setSelected}
          />
        </div>
      </Panel>

      <Drawer
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.fullName || 'Licence'}
        subtitle={selected?.displayNumber}
      >
        {selected ? (
          <>
            <DetailRow label="Licence number" value={selected.displayNumber} mono />
            <DetailRow label="Codes" value={selected.codes.join(', ')} mono />
            <DetailRow label="Issue date" value={selected.issueDate} />
            <DetailRow label="Expiry date" value={selected.expiryDate} />
            <DetailRow
              label="Status"
              value={<ResultBadge result={statusResult[selected.status]} />}
            />
            {selected.restrictions.length ? (
              <DetailRow label="Restrictions" value={selected.restrictions.join('; ')} />
            ) : null}

            <p className="mb-2 mt-6 text-xs font-semibold uppercase tracking-wider text-console-muted">
              Recent verifications
            </p>
            <ul className="space-y-2">
              {historyFor(selected).map((v) => (
                <li
                  key={v.id}
                  className="flex items-center justify-between rounded border border-console-border px-3 py-2 text-xs"
                >
                  <span className="font-mono text-console-muted">{v.scanId}</span>
                  <ResultBadge result={v.result} />
                </li>
              ))}
              {!historyFor(selected).length ? (
                <li className="text-xs text-console-muted">No scans recorded</li>
              ) : null}
            </ul>
          </>
        ) : null}
      </Drawer>
    </>
  );
}
