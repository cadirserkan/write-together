import { useState, type FormEvent } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { messageOf } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import { safeNextPath } from '../auth/next';
import { Logo } from '../components/Logo';
import { SpineRow } from '../components/SpineRow';

export function LoginPage() {
  const { user, login } = useAuth();
  const [searchParams] = useSearchParams();
  const next = safeNextPath(searchParams.get('next'));

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  // Also covers the moment right after a successful login.
  if (user !== null) {
    return <Navigate to={next} replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await login(username, password);
    } catch (e) {
      setError(messageOf(e));
      setBusy(false);
    }
  }

  return (
    <div className="auth-screen">
      <main className="auth">
        <Logo size={72} />
        <h1>Write Together</h1>
        <p className="auth-tagline">Schrijf samen een boek, om de beurt.</p>

        <form className="card" onSubmit={handleSubmit}>
          <label className="field">
            <span>Gebruikersnaam</span>
            <input
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="username"
              autoCapitalize="none"
              required
              autoFocus
            />
          </label>

          <label className="field">
            <span>Wachtwoord</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />
          </label>

          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}

          <button type="submit" className="button button-wide" disabled={busy}>
            Inloggen
          </button>
        </form>

        <p className="auth-switch">
          Nog geen account? <Link to={`/register?next=${encodeURIComponent(next)}`}>Maak er een aan</Link>
        </p>
      </main>
      <SpineRow />
    </div>
  );
}
