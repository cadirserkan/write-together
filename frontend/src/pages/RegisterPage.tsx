import { useState, type FormEvent } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { messageOf } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import { safeNextPath } from '../auth/next';
import { Logo } from '../components/Logo';
import { SpineRow } from '../components/SpineRow';
import { usePageTitle } from '../usePageTitle';

export function RegisterPage() {
  usePageTitle('Account aanmaken');
  const { user, register } = useAuth();
  const [searchParams] = useSearchParams();
  const next = safeNextPath(searchParams.get('next'));

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  if (user !== null) {
    return <Navigate to={next} replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await register(username, email, password);
    } catch (e) {
      setError(messageOf(e));
      setBusy(false);
    }
  }

  return (
    <div className="auth-screen">
      <main className="auth">
        <Logo size={72} />
        <h1>Account aanmaken</h1>
        <p className="auth-tagline">Met een account kan je boeken starten en meeschrijven.</p>

        <form className="card" onSubmit={handleSubmit}>
          <label className="field">
            <span>Gebruikersnaam</span>
            <input
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="username"
              autoCapitalize="none"
              minLength={3}
              maxLength={30}
              pattern="[A-Za-z0-9_.\-]+"
              title="Letters, cijfers, punt, streepje of underscore"
              required
              autoFocus
            />
            <small>Zo zien anderen je bij de boeken die jullie samen schrijven.</small>
          </label>

          <label className="field">
            <span>E-mailadres</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />
          </label>

          <label className="field">
            <span>Wachtwoord</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="new-password"
              minLength={8}
              maxLength={100}
              required
            />
            <small>Minstens 8 tekens.</small>
          </label>

          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}

          <button type="submit" className="button button-wide" disabled={busy}>
            Account aanmaken
          </button>
        </form>

        <p className="auth-switch">
          Heb je al een account? <Link to={`/login?next=${encodeURIComponent(next)}`}>Log in</Link>
        </p>
      </main>
      <SpineRow />
    </div>
  );
}
