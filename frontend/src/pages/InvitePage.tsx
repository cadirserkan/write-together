import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, messageOf } from '../api/client';
import type { Invitation } from '../api/types';
import { useAuth } from '../auth/AuthContext';

export function InvitePage() {
  const { code = '' } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [declined, setDeclined] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .getInvitation(code)
      .then(setInvitation)
      .catch((e: unknown) => setError(messageOf(e)));
  }, [code]);

  async function accept() {
    setBusy(true);
    setError('');
    try {
      const accepted = await api.acceptInvitation(code);
      navigate(`/books/${accepted.bookId}`);
    } catch (e) {
      setError(messageOf(e));
      setBusy(false);
    }
  }

  async function decline() {
    setBusy(true);
    setError('');
    try {
      await api.declineInvitation(code);
      setDeclined(true);
    } catch (e) {
      setError(messageOf(e));
    } finally {
      setBusy(false);
    }
  }

  if (invitation === null) {
    return (
      <div className="status-text">
        <p>{error || 'Even laden...'}</p>
        {error && <Link to="/">Naar je boekenkast</Link>}
      </div>
    );
  }

  const ownInvitation = invitation.invitedBy === user?.username;

  return (
    <article className="page page-narrow">
      {ownInvitation ? (
        <>
          <h1>Dit is je eigen uitnodiging</h1>
          <p>
            Stuur deze link door naar wie je wil laten meeschrijven aan <em>{invitation.bookTitle}</em>.
          </p>
          <Link to={`/books/${invitation.bookId}`}>Naar het boek</Link>
        </>
      ) : declined ? (
        <>
          <h1>Uitnodiging geweigerd</h1>
          <p>Je schrijft niet mee aan dit boek.</p>
          <Link to="/">Naar je boekenkast</Link>
        </>
      ) : invitation.status !== 'OPEN' ? (
        <>
          <h1>Deze uitnodiging is niet meer geldig</h1>
          <p>Ze is al gebruikt of geweigerd. Vraag {invitation.invitedBy} om een nieuwe link.</p>
          <Link to="/">Naar je boekenkast</Link>
        </>
      ) : (
        <>
          <h1>{invitation.invitedBy} nodigt je uit</h1>
          <p>
            Schrijf om de beurt mee aan <em>{invitation.bookTitle}</em>. Jullie vullen elk een stukje aan,
            wanneer het jullie past.
          </p>
          <div className="invite-actions">
            <button type="button" className="button" onClick={() => void accept()} disabled={busy}>
              Meeschrijven
            </button>
            <button type="button" className="button button-quiet" onClick={() => void decline()} disabled={busy}>
              Nee, bedankt
            </button>
          </div>
        </>
      )}

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
    </article>
  );
}
