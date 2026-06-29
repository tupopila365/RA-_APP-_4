import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';
import { SelectField } from '../ui/SearchField';

export function TopBar() {
  const { user, logout } = useAuth();

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-console-border bg-console-bg/80 px-6 backdrop-blur-md">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="live-dot h-2 w-2 rounded-full bg-verify-valid" />
          <span className="text-xs font-medium uppercase tracking-wider text-console-muted">
            National verification network
          </span>
        </div>
        <span className="hidden text-console-border sm:inline">|</span>
        <SelectField
          value="nampol-wh"
          onChange={() => {}}
          className="hidden !border-0 !bg-transparent !py-1 text-xs sm:block"
          options={[
            { value: 'nampol-wh', label: 'NAMPOL · Windhoek Traffic' },
            { value: 'all', label: 'All organisations' },
          ]}
        />
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium text-console-text">{user?.name}</p>
          <p className="text-xs capitalize text-console-muted">{user?.role?.replace('_', ' ')}</p>
        </div>
        <Button variant="ghost" onClick={logout} className="!text-xs">
          Sign out
        </Button>
      </div>
    </header>
  );
}
