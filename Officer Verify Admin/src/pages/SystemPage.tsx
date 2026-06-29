import { useState } from 'react';
import { Button, PageHeader, Panel } from '../components/ui';
import { defaultSettings } from '../data/mockData';
import type { SystemSettings } from '../types';

function SettingRow({
  label,
  description,
  children,
}: {
  label: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-console-border py-5 last:border-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="max-w-lg">
        <p className="text-sm font-medium text-console-text">{label}</p>
        <p className="mt-0.5 text-xs text-console-muted">{description}</p>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

export function SystemPage() {
  const [settings, setSettings] = useState<SystemSettings>({ ...defaultSettings });
  const [saved, setSaved] = useState(false);

  const save = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <>
      <PageHeader
        title="System"
        description="Verification platform configuration — affects myRA and RA Verifier apps."
        actions={
          <Button onClick={save}>{saved ? 'Saved ✓' : 'Save changes'}</Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="QR token policy">
          <SettingRow
            label="Token lifetime"
            description="How long a driver QR remains valid (seconds)."
          >
            <input
              type="number"
              value={settings.qrTokenTtlSeconds}
              onChange={(e) =>
                setSettings((s) => ({ ...s, qrTokenTtlSeconds: Number(e.target.value) }))
              }
              className="w-24 rounded-lg border border-console-border bg-console-elevated px-3 py-2 font-mono text-sm"
            />
          </SettingRow>
          <SettingRow
            label="Single-use tokens"
            description="Invalidate token after first successful scan."
          >
            <Toggle
              checked={settings.qrTokenSingleUse}
              onChange={(v) => setSettings((s) => ({ ...s, qrTokenSingleUse: v }))}
            />
          </SettingRow>
          <SettingRow
            label="Max tokens per driver / hour"
            description="Rate limit to prevent QR farming."
          >
            <input
              type="number"
              value={settings.maxTokensPerDriverPerHour}
              onChange={(e) =>
                setSettings((s) => ({
                  ...s,
                  maxTokensPerDriverPerHour: Number(e.target.value),
                }))
              }
              className="w-24 rounded-lg border border-console-border bg-console-elevated px-3 py-2 font-mono text-sm"
            />
          </SettingRow>
        </Panel>

        <Panel title="Verifier app">
          <SettingRow
            label="Manual lookup"
            description="Allow officers to search by licence number without QR."
          >
            <Toggle
              checked={settings.manualLookupEnabled}
              onChange={(v) => setSettings((s) => ({ ...s, manualLookupEnabled: v }))}
            />
          </SettingRow>
          <SettingRow
            label="Minimum app version"
            description="Block older RA Verifier builds."
          >
            <input
              type="text"
              value={settings.verifierMinAppVersion}
              onChange={(e) =>
                setSettings((s) => ({ ...s, verifierMinAppVersion: e.target.value }))
              }
              className="w-28 rounded-lg border border-console-border bg-console-elevated px-3 py-2 font-mono text-sm"
            />
          </SettingRow>
          <SettingRow
            label="Maintenance mode"
            description="Pause new verifications nationwide."
          >
            <Toggle
              checked={settings.maintenanceMode}
              onChange={(v) => setSettings((s) => ({ ...s, maintenanceMode: v }))}
            />
          </SettingRow>
          {settings.maintenanceMode ? (
            <textarea
              value={settings.maintenanceMessage}
              onChange={(e) =>
                setSettings((s) => ({ ...s, maintenanceMessage: e.target.value }))
              }
              placeholder="Message shown on Verifier app…"
              className="mt-2 w-full rounded-lg border border-console-border bg-console-elevated px-3 py-2 text-sm"
              rows={3}
            />
          ) : null}
        </Panel>
      </div>

      <Panel className="mt-6" title="Change log" subtitle="Prototype — no persistence">
        <ul className="space-y-2 font-mono text-xs text-console-muted">
          <li>2026-06-25 09:00 · Selma Kauku · qr_token_ttl_seconds → 60</li>
          <li>2026-06-20 14:30 · System · manual_lookup_enabled → true</li>
        </ul>
      </Panel>
    </>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative h-7 w-12 rounded-full transition ${
        checked ? 'bg-console-accent' : 'bg-console-border'
      }`}
    >
      <span
        className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition ${
          checked ? 'left-5' : 'left-0.5'
        }`}
      />
    </button>
  );
}
