import { useState } from 'react';
import { api, messageOf } from '../api/client';

export function InviteBox({ bookId, bookTitle }: { bookId: number; bookTitle: string }) {
  const [link, setLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function createLink() {
    setBusy(true);
    setError('');
    try {
      const invitation = await api.createInvitation(bookId);
      setLink(`${window.location.origin}/invite/${invitation.code}`);
    } catch (e) {
      setError(messageOf(e));
    } finally {
      setBusy(false);
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
    } catch {
      setError('Kopiëren lukte niet. Selecteer de link en kopieer hem zelf.');
    }
  }

  async function shareLink() {
    try {
      await navigator.share({
        title: 'Write Together',
        text: `Schrijf je mee aan "${bookTitle}"?`,
        url: link,
      });
    } catch {
      // The share sheet was closed without sharing.
    }
  }

  return (
    <section className="invite">
      <h2>Nodig iemand uit om mee te schrijven</h2>
      <p>Je krijgt een link. Wie hem opent en aanvaardt, schrijft om de beurt met jou aan dit boek.</p>

      {link === '' ? (
        <button type="button" className="button" onClick={() => void createLink()} disabled={busy}>
          Maak een uitnodigingslink
        </button>
      ) : (
        <div className="invite-link">
          <input
            type="text"
            value={link}
            readOnly
            aria-label="Uitnodigingslink"
            onFocus={(event) => event.target.select()}
          />
          <button type="button" className="button" onClick={() => void copyLink()}>
            {copied ? 'Gekopieerd' : 'Kopieer link'}
          </button>
          {'share' in navigator && (
            <button type="button" className="button button-quiet" onClick={() => void shareLink()}>
              Delen
            </button>
          )}
        </div>
      )}

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
