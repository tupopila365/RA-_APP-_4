import { NavLink } from 'react-router-dom';

const links = [
  { to: '/', label: 'Command Center', icon: '◉' },
  { to: '/officers', label: 'Officers', icon: '◎' },
  { to: '/verifications', label: 'Verification Log', icon: '▤' },
  { to: '/incidents', label: 'Incidents', icon: '⚠' },
  { to: '/licences', label: 'Licences', icon: '▣' },
  { to: '/system', label: 'System', icon: '⚙' },
];

export function SideNav() {
  return (
    <nav className="flex w-56 shrink-0 flex-col border-r border-console-border bg-console-surface">
      <div className="border-b border-console-border px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-console-accent/15 ring-1 ring-console-accent/40">
            <span className="text-lg font-bold text-console-accent">RA</span>
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight text-console-text">Verify Console</p>
            <p className="text-[10px] uppercase tracking-widest text-console-muted">Operations</p>
          </div>
        </div>
      </div>

      <ul className="flex-1 space-y-0.5 p-3">
        {links.map((link) => (
          <li key={link.to}>
            <NavLink
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? 'bg-console-accent/15 text-console-accent ring-1 ring-console-accent/30'
                    : 'text-console-muted hover:bg-console-elevated hover:text-console-text'
                }`
              }
            >
              <span className="w-4 text-center text-xs opacity-80">{link.icon}</span>
              {link.label}
            </NavLink>
          </li>
        ))}
      </ul>

      <div className="border-t border-console-border p-4">
        <div className="rounded-lg border border-console-gold/30 bg-console-gold/5 px-3 py-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-console-gold">Environment</p>
          <p className="mt-0.5 font-mono text-xs text-console-text">PROTOTYPE</p>
        </div>
      </div>
    </nav>
  );
}
