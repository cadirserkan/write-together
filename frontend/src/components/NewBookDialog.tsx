import { useEffect, useRef, useState, type FormEvent } from 'react';
import { api, messageOf } from '../api/client';
import type { BookSummary } from '../api/types';
import { BookCover, COVER_COLORS } from './BookCover';

interface NewBookDialogProps {
  onClose: () => void;
  onCreated: (book: BookSummary) => void;
}

export function NewBookDialog({ onClose, onCreated }: NewBookDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [title, setTitle] = useState('');
  const [color, setColor] = useState(COVER_COLORS[0].value);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  // A native <dialog> gives us the dark backdrop, focus trapping and closing with Escape for free.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) {
      dialog.showModal();
    }
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      onCreated(await api.createBook(title, color));
    } catch (e) {
      setError(messageOf(e));
      setBusy(false);
    }
  }

  return (
    <dialog ref={dialogRef} className="dialog" onClose={onClose} aria-labelledby="new-book-heading">
      <form onSubmit={handleSubmit} className="new-book">
        <div className="new-book-preview">
          <BookCover title={title.trim() || 'Titel van je boek'} color={color} />
        </div>

        <div className="new-book-fields">
          <h2 id="new-book-heading">Nieuw boek</h2>

          <label className="field">
            <span>Titel</span>
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={80}
              required
              autoFocus
            />
          </label>

          <fieldset className="swatches">
            <legend>Kleur van de cover</legend>
            {COVER_COLORS.map((option) => (
              <label key={option.value} className="swatch" title={option.name}>
                <input
                  type="radio"
                  name="cover-color"
                  value={option.value}
                  checked={color === option.value}
                  onChange={() => setColor(option.value)}
                />
                <span style={{ backgroundColor: option.value }} />
                <span className="visually-hidden">{option.name}</span>
              </label>
            ))}
          </fieldset>

          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}

          <div className="dialog-actions">
            <button type="button" className="button button-quiet" onClick={onClose}>
              Annuleren
            </button>
            <button type="submit" className="button" disabled={busy || title.trim() === ''}>
              Boek starten
            </button>
          </div>
        </div>
      </form>
    </dialog>
  );
}
