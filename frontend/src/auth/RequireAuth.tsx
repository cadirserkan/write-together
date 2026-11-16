import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { useAuth } from './AuthContext';

// Wraps every page that needs a logged-in user.
export function RequireAuth() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <p className="status-text">Even laden...</p>;
  }

  if (user === null) {
    // Remember where the visitor wanted to go (an invitation link, for example)
    // so we can send them there after logging in.
    const next = encodeURIComponent(location.pathname);
    return <Navigate to={`/login?next=${next}`} replace />;
  }

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}
