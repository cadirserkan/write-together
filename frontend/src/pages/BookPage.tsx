import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, messageOf } from '../api/client';
import type { BookDetail } from '../api/types';
import { useAuth } from '../auth/AuthContext';
import { InviteBox } from '../components/InviteBox';
import { WriteForm } from '../components/WriteForm';

const REFRESH_INTERVAL_MS = 15_000;

export function BookPage() {
  const { id } = useParams();
  const bookId = Number(id);
  const { user } = useAuth();

  const [book, setBook] = useState<BookDetail | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    // "cancelled" prevents an answer for a previous book from showing up after navigating away.
    let cancelled = false;
    setBook(null);
    setError('');

    api
      .getBook(bookId)
      .then((loaded) => {
        if (!cancelled) {
          setBook(loaded);
        }
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setError(messageOf(e));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [bookId]);

  const refresh = useCallback(async () => {
    try {
      setBook(await api.getBook(bookId));
    } catch {
      // Keep showing what we have; the next refresh will try again.
    }
  }, [bookId]);

  // While the other writer is busy, look for their piece every few seconds.
  const waitingForPartner = book !== null && book.status === 'IN_PROGRESS' && !book.myTurn;
  useEffect(() => {
    if (!waitingForPartner) {
      return;
    }
    const timer = window.setInterval(() => void refresh(), REFRESH_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [waitingForPartner, refresh]);

  async function finish() {
    const sure = window.confirm('Wil je dit boek afsluiten? Daarna kan niemand er nog iets bij schrijven.');
    if (!sure) {
      return;
    }
    try {
      await api.finishBook(bookId);
      await refresh();
    } catch (e) {
      setError(messageOf(e));
    }
  }

  if (book === null) {
    return (
      <div className="status-text">
        <p>{error || 'Even laden...'}</p>
        {error && <Link to="/">Terug naar je boekenkast</Link>}
      </div>
    );
  }

  const finished = book.status === 'FINISHED';
  const me = user?.username ?? '';
  const writers = book.partner ? `${me} en ${book.partner}` : me;

  return (
    <>
      <Link to="/" className="back-link">
        Terug naar je boekenkast
      </Link>

      <article className="page" style={{ borderTopColor: book.coverColor }}>
        <header className="page-head">
          <h1>{book.title}</h1>
          <p className="byline">Geschreven door {writers}</p>
        </header>

        {book.entries.map((entry) => (
          <section key={entry.id} className="piece">
            <span className="piece-author">{entry.author}</span>
            <p className="piece-text">{entry.text}</p>
          </section>
        ))}

        {finished && <p className="the-end">Einde</p>}

        {!finished && book.myTurn && (
          <WriteForm bookId={book.id} opening={book.entries.length === 0} onWritten={() => void refresh()} />
        )}

        {!finished && !book.myTurn && book.partner && (
          <p className="turn-note">
            {book.currentTurn} is aan de beurt. Deze pagina ververst vanzelf zodra er een nieuw stuk staat.
          </p>
        )}

        {!finished && book.owner && !book.partner && <InviteBox bookId={book.id} bookTitle={book.title} />}

        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}

        {!finished && book.owner && book.entries.length > 0 && (
          <footer className="page-foot">
            <button type="button" className="text-button" onClick={() => void finish()}>
              Boek afsluiten
            </button>
          </footer>
        )}
      </article>
    </>
  );
}
