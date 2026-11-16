import { useState, type FormEvent } from 'react';
import { api, messageOf } from '../api/client';

const MAX_LENGTH = 2000;

interface WriteFormProps {
  bookId: number;
  // True when the book is still empty and this is the very first piece.
  opening: boolean;
  onWritten: () => void;
}

export function WriteForm({ bookId, opening, onWritten }: WriteFormProps) {
  // A half-written piece is kept in the browser, so you can stop and continue later.
  const draftKey = `wt_draft_${bookId}`;
  const [text, setText] = useState(() => localStorage.getItem(draftKey) ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  function handleChange(value: string) {
    setText(value);
    localStorage.setItem(draftKey, value);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api.writeEntry(bookId, text);
      localStorage.removeItem(draftKey);
      setText('');
      onWritten();
    } catch (e) {
      setError(messageOf(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="write" onSubmit={handleSubmit}>
      <label htmlFor="piece">{opening ? 'Schrijf het begin van het verhaal' : 'Jij bent aan de beurt'}</label>
      <textarea
        id="piece"
        value={text}
        onChange={(event) => handleChange(event.target.value)}
        maxLength={MAX_LENGTH}
        placeholder={opening ? 'Er was eens...' : 'Schrijf hier hoe het verder gaat...'}
        required
      />

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}

      <div className="write-row">
        <span className="counter">
          {text.length} / {MAX_LENGTH}
        </span>
        <button type="submit" className="button" disabled={busy || text.trim() === ''}>
          Zet in het boek
        </button>
      </div>
    </form>
  );
}
