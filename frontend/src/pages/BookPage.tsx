import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, messageOf } from '../api/client';
import type { BookDetail } from '../api/types';
import { useAuth } from '../auth/AuthContext';
import { InviteBox } from '../components/InviteBox';
import { NotificationHint } from '../components/NotificationHint';
import { WriteForm } from '../components/WriteForm';
import { usePageTitle } from '../usePageTitle';

const REFRESH_INTERVAL_MS = 15_000;

export function BookPage() {
  const { id } = useParams();
  const bookId = Number(id);
  const { user } = useAuth();

  const [book, setBook] = useState<BookDetail | null>(null);
  const [error, setError] = useState('');
  usePageTitle(book?.title ?? 'Boek');

  // Ids of the pieces already on screen. Pieces that are not in here yet
  // (just written by you, or just arrived from the other writer) get a short animation.
  const shownIds = useRef<Set<number> | null>(null);
  const [freshIds, setFreshIds] = useState<Set<number>>(new Set());

  const show = useCallback((next: BookDetail) => {
    const shown = shownIds.current;
    // On the first load nothing is new: the whole page simply opens.
    setFreshIds(
      shown === null
        ? new Set()
        : new Set(next.entries.filter((entry) => !shown.has(entry.id)).map((entry) => entry.id)),
    );
    shownIds.current = new Set(next.entries.map((entry) => entry.id));
    setBook(next);
  }, []);

  useEffect(() => {
    // "cancelled" prevents an answer for a previous book from showing up after navigating away.
    let cancelled = false;
    setBook(null);
    setError('');
    shownIds.current = null;

    api
      .getBook(bookId)
      .then((loaded) => {
        if (!cancelled) {
          show(loaded);
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
  }, [bookId, show]);

  const refresh = useCallback(async () => {
    try {
      show(await api.getBook(bookId));
    } catch {
      // Keep showing what we have; the next refresh will try again.
    }
  }, [bookId, show]);

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
          <section key={entry.id} className={freshIds.has(entry.id) ? 'piece piece-fresh' : 'piece'}>
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
            <span className="writing-dots" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
            {book.currentTurn} is aan de beurt. Deze pagina ververst vanzelf zodra er een nieuw stuk staat.
          </p>
        )}

        {!finished && !book.myTurn && book.partner && <NotificationHint />}

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
