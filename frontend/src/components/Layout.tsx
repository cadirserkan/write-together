import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { Logo } from './Logo';
import { NotificationButton } from './NotificationButton';

export function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();

  return (
    <>
      <header className="topbar">
        <Link to="/" className="brand">
          <Logo />
          <span>Write Together</span>
        </Link>

        <div className="topbar-actions">
          <NotificationButton />
          <span className="topbar-user">{user?.username}</span>
          <button type="button" className="text-button" onClick={() => void logout()}>
            Uitloggen
          </button>
        </div>
      </header>

      <main className="content">{children}</main>
    </>
  );
}
