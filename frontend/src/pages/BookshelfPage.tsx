import { useEffect, useState, type CSSProperties } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, messageOf } from '../api/client';
import type { BookSummary } from '../api/types';
import { BookCover } from '../components/BookCover';
import { NewBookDialog } from '../components/NewBookDialog';

export function BookshelfPage() {
  const navigate = useNavigate();
  const [books, setBooks] = useState<BookSummary[] | null>(null);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    api
      .getBookshelf()
      .then(setBooks)
      .catch((e: unknown) => setError(messageOf(e)));
  }, []);

  if (error) {
    return <p className="status-text">{error}</p>;
  }
  if (books === null) {
    return <p className="status-text">Even laden...</p>;
  }

  // Books that wait for you come first, finished books go to the end of the shelf.
  const sorted = [...books].sort((a, b) => shelfOrder(a) - shelfOrder(b));
  const waiting = books.filter((book) => book.myTurn).length;

  return (
    <>
      <div className="shelf-head">
        <h1>Jouw boekenkast</h1>
        <p>{introText(books.length, waiting)}</p>
      </div>

      <ul className="shelf">
        {sorted.map((book, index) => (
          <li key={book.id} style={shelfPosition(index)}>
            <Link to={`/books/${book.id}`} className="cover-link">
              <BookCover title={book.title} color={book.coverColor} ribbon={book.myTurn}>
                {book.partner ? `met ${book.partner}` : 'nog alleen'}
                <strong>{statusText(book)}</strong>
              </BookCover>
            </Link>
          </li>
        ))}
        <li style={shelfPosition(sorted.length)}>
          <button type="button" className="cover cover-new" onClick={() => setDialogOpen(true)}>
            <span className="cover-new-plus" aria-hidden="true">
              +
            </span>
            Nieuw boek
          </button>
        </li>
      </ul>

      {dialogOpen && (
        <NewBookDialog
          onClose={() => setDialogOpen(false)}
          onCreated={(book) => navigate(`/books/${book.id}`)}
        />
      )}
    </>
  );
}

// The CSS uses --i to let the books land on the shelf one after the other.
// After ten books the delay stops growing, so a full shelf does not keep you waiting.
function shelfPosition(index: number): CSSProperties {
  return { '--i': Math.min(index, 10) } as CSSProperties;
}

function shelfOrder(book: BookSummary): number {
  if (book.status === 'FINISHED') {
    return 2;
  }
  return book.myTurn ? 0 : 1;
}

function statusText(book: BookSummary): string {
  if (book.status === 'FINISHED') {
    return 'Af';
  }
  if (book.myTurn) {
    return 'Jouw beurt';
  }
  return book.partner ? `Wacht op ${book.partner}` : 'Nodig iemand uit';
}

function introText(total: number, waiting: number): string {
  if (total === 0) {
    return 'Je kast is nog leeg. Start een boek en nodig iemand uit om mee te schrijven.';
  }
  if (waiting === 0) {
    return 'Niemand wacht op jou. Lees wat er al staat of start een nieuw boek.';
  }
  return waiting === 1 ? '1 boek wacht op jouw stuk.' : `${waiting} boeken wachten op jouw stuk.`;
}
