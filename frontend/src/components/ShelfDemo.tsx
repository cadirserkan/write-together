import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { BookCover } from './BookCover';

const EXAMPLES = [
  { title: 'De koffer op zolder', color: '#3b62a8', with: 'met Emre', status: 'Jouw beurt', ribbon: true },
  { title: 'Zomer bij oma', color: '#d39b22', with: 'met mama', status: 'Wacht op mama', ribbon: false },
  { title: 'Wat de buren niet weten', color: '#8a3d63', with: 'met je zus', status: 'Jouw beurt', ribbon: true },
  { title: 'Brieven aan later', color: '#4c8c5a', with: 'met Noor', status: 'Af', ribbon: false },
];

// The books land on the shelf the first time the shelf scrolls into view.
export function ShelfDemo() {
  const shelfRef = useRef<HTMLUListElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const shelf = shelfRef.current;
    if (shelf === null) {
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    observer.observe(shelf);
    return () => observer.disconnect();
  }, []);

  return (
    <ul ref={shelfRef} className={visible ? 'shelf shelf-demo is-visible' : 'shelf shelf-demo'} aria-hidden="true">
      {EXAMPLES.map((book, index) => (
        <li key={book.title} style={{ '--i': index } as CSSProperties}>
          <BookCover title={book.title} color={book.color} ribbon={book.ribbon}>
            {book.with}
            <strong>{book.status}</strong>
          </BookCover>
        </li>
      ))}
    </ul>
  );
}
