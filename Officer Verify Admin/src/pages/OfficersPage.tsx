import { useMemo, useState } from 'react';
import {
  Button,
  DataTable,
  PageHeader,
  Panel,
  SearchField,
  SelectField,
  StatusDot,
} from '../components/ui';
import { officers } from '../data/mockData';
import type { Officer } from '../types';

function formatRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return new Date(iso).toLocaleDateString();
}

export function OfficersPage() {
  const [search, setSearch] = useState('');
  const [orgFilter, setOrgFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = useMemo(() => {
    return officers.filter((o) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        o.name.toLowerCase().includes(q) ||
        o.officerId.toLowerCase().includes(q) ||
        o.unit.toLowerCase().includes(q);
      const matchOrg = orgFilter === 'all' || o.organisation === orgFilter;
      const matchStatus = statusFilter === 'all' || o.status === statusFilter;
      return matchSearch && matchOrg && matchStatus;
    });
  }, [search, orgFilter, statusFilter]);

  const columns = [
    {
      key: 'officer',
      header: 'Officer',
      render: (o: Officer) => (
        <div>
          <p className="font-medium text-console-text">{o.name}</p>
          <p className="font-mono text-xs text-console-muted">{o.officerId}</p>
        </div>
      ),
    },
    {
      key: 'org',
      header: 'Organisation',
      render: (o: Officer) => (
        <div>
          <p className="text-sm">{o.organisation}</p>
          <p className="text-xs text-console-muted">{o.unit}</p>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (o: Officer) => (
        <span className="inline-flex items-center gap-2 capitalize text-sm">
          <StatusDot status={o.status} />
          {o.status}
        </span>
      ),
    },
    {
      key: 'active',
      header: 'Last active',
      render: (o: Officer) => (
        <span className="text-sm text-console-muted">{formatRelative(o.lastActive)}</span>
      ),
    },
    {
      key: 'scans',
      header: 'Scans (7d)',
      render: (o: Officer) => (
        <span className="font-mono text-sm tabular-nums">{o.scans7d}</span>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      render: (o: Officer) => <span className="text-sm text-console-muted">{o.role}</span>,
    },
  ];

  return (
    <>
      <PageHeader
        title="Officers"
        description="Verifier workforce — accounts for the RA Verifier mobile app."
        actions={<Button>Add officer</Button>}
      />

      <Panel noPadding>
        <div className="flex flex-col gap-3 border-b border-console-border p-4 sm:flex-row sm:items-center">
          <SearchField
            value={search}
            onChange={setSearch}
            placeholder="Search name, ID, unit…"
            className="flex-1"
          />
          <SelectField
            value={orgFilter}
            onChange={setOrgFilter}
            options={[
              { value: 'all', label: 'All organisations' },
              { value: 'NAMPOL', label: 'NAMPOL' },
              { value: 'RA', label: 'RA' },
            ]}
          />
          <SelectField
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: 'all', label: 'All statuses' },
              { value: 'active', label: 'Active' },
              { value: 'suspended', label: 'Suspended' },
              { value: 'inactive', label: 'Inactive' },
            ]}
          />
        </div>
        <div className="p-4">
          <DataTable columns={columns} data={filtered} keyField="id" />
        </div>
      </Panel>
    </>
  );
}
