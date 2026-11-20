import { useAuth } from '../auth/AuthContext';
import { Layout } from '../components/Layout';
import { BookshelfPage } from './BookshelfPage';
import { LandingPage } from './LandingPage';
import { LoadingScreen } from '../components/LoadingScreen';

// "/" shows the bookshelf to someone who is logged in, and the landing page to everyone else.
export function HomePage() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (user === null) {
    return <LandingPage />;
  }

  return (
    <Layout>
      <BookshelfPage />
    </Layout>
  );
}
