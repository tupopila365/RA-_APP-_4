import type { ReactNode } from 'react';
import { Button } from './Button';

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function Drawer({ open, onClose, title, subtitle, children, footer }: DrawerProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close"
      />
      <aside className="relative flex h-full w-full max-w-lg flex-col border-l border-console-border bg-console-surface shadow-panel">
        <header className="flex items-start justify-between gap-4 border-b border-console-border px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-console-text">{title}</h2>
            {subtitle ? <p className="mt-1 font-mono text-xs text-console-muted">{subtitle}</p> : null}
          </div>
          <Button variant="ghost" onClick={onClose} className="!px-2">
            ✕
          </Button>
        </header>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer ? (
          <footer className="border-t border-console-border px-6 py-4">{footer}</footer>
        ) : null}
      </aside>
    </div>
  );
}

export function DetailRow({ label, value, mono }: { label: string; value: ReactNode; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-4 border-b border-console-border/50 py-3 last:border-0">
      <span className="text-xs text-console-muted">{label}</span>
      <span className={`text-right text-sm text-console-text ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  );
}
