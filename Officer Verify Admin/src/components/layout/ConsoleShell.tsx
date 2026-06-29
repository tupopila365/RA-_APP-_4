import { Outlet } from 'react-router-dom';
import { SideNav } from './SideNav';
import { TopBar } from './TopBar';

export function ConsoleShell() {
  return (
    <div className="flex h-screen overflow-hidden bg-console-bg">
      <SideNav />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="console-grid-bg flex-1 overflow-y-auto p-6">{<Outlet />}</main>
      </div>
    </div>
  );
}
