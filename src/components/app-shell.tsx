import { ReactNode } from 'react';
import { NavBar } from './nav-bar';

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <>
      <NavBar />
      <main className="container-shell py-6 md:py-8">{children}</main>
    </>
  );
}
